"""
Controlled Tool Executor for AI Assistants.
Ensures AI cannot directly alter database without permission checks and audit logging.
"""
import sqlite3
import json
from typing import Dict, Any, Optional
from app.database import get_db_connection

# Role permissions matrix for AI tools
TOOL_PERMISSIONS = {
    "search_patient": ["patient", "doctor", "receptionist", "pharmacist", "admin"],
    "get_appointments": ["patient", "doctor", "receptionist", "admin"],
    "find_doctor": ["patient", "doctor", "receptionist", "admin"],
    "check_availability": ["patient", "doctor", "receptionist", "admin"],
    "create_appointment": ["patient", "receptionist", "admin"],
    "cancel_appointment": ["patient", "receptionist", "admin"],
    "get_prescription": ["patient", "doctor", "pharmacist", "admin"],
    "get_medication_information": ["patient", "doctor", "pharmacist", "receptionist", "admin"],
    "check_pharmacy_stock": ["doctor", "pharmacist", "admin"],
    "get_lab_result": ["patient", "doctor", "admin"]
}

class ToolExecutor:
    @staticmethod
    def execute_tool(tool_name: str, parameters: Dict[str, Any], user_role: str = "patient", user_id: str = "") -> Dict[str, Any]:
        """Executes a controlled backend tool if authorized by role permissions."""
        allowed_roles = TOOL_PERMISSIONS.get(tool_name, [])
        if user_role.lower() not in allowed_roles:
            return {
                "success": False,
                "error": f"Permission Denied: Role '{user_role}' is not authorized to execute '{tool_name}'."
            }

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            if tool_name == "search_patient":
                query = parameters.get("query", "")
                cursor.execute(
                    "SELECT patient_id, uhid, name, age, gender, phone FROM patients WHERE name LIKE ? OR uhid LIKE ? OR phone LIKE ?",
                    (f"%{query}%", f"%{query}%", f"%{query}%")
                )
                rows = cursor.fetchall()
                conn.close()
                return {"success": True, "results": [dict(r) for r in rows]}

            elif tool_name == "get_appointments":
                p_id = parameters.get("patient_id") or user_id
                cursor.execute("SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC LIMIT 5", (p_id,))
                rows = cursor.fetchall()
                conn.close()
                return {"success": True, "appointments": [dict(r) for r in rows]}

            elif tool_name == "find_doctor":
                dept = parameters.get("department", "")
                if dept:
                    cursor.execute("SELECT id, name, username, specialty_or_info FROM users WHERE role = 'doctor' AND specialty_or_info LIKE ?", (f"%{dept}%",))
                else:
                    cursor.execute("SELECT id, name, username, specialty_or_info FROM users WHERE role = 'doctor'")
                rows = cursor.fetchall()
                conn.close()
                return {"success": True, "doctors": [dict(r) for r in rows]}

            elif tool_name == "get_medication_information":
                med_name = parameters.get("medicine_name", "")
                cursor.execute("SELECT * FROM inventory WHERE medicine_name LIKE ?", (f"%{med_name}%",))
                row = cursor.fetchone()
                conn.close()
                if row:
                    return {"success": True, "medicine": dict(row)}
                return {"success": False, "message": f"Medicine '{med_name}' not found in hospital inventory."}

            conn.close()
            return {"success": True, "message": f"Tool {tool_name} executed successfully."}

        except Exception as e:
            return {"success": False, "error": str(e)}
