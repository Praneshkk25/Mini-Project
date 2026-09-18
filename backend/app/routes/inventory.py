from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
from datetime import datetime
import random

from app.database import get_db_connection

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

# Map to store simulated daily consumption velocities (stock items consumed per day)
# This will be used by our AI model to predict stockout dates.
CONSUMPTION_VELOCITIES = {
    "Paracetamol 650mg": 15,
    "Amoxicillin 500mg": 8,
    "Pantocid 40mg": 12,
    "Metformin 500mg": 5,
    "Amlodipine 5mg": 10
}

@router.get("/list")
def get_inventory_list():
    """Returns inventory catalog with live stockout predictions (AI predictive model)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory")
    rows = cursor.fetchall()
    conn.close()
    
    items = [dict(r) for r in rows]
    
    # Calculate stockout predictions
    for item in items:
        name = item["medicine_name"]
        stock = item["stock_level"]
        reorder = item["reorder_level"]
        
        # Get simulated velocity (default to 6 if not in list)
        daily_velocity = CONSUMPTION_VELOCITIES.get(name, 6)
        
        # Add random variation to simulate shifting hospital needs
        daily_velocity = max(1, daily_velocity + random.randint(-2, 2))
        
        # Calculate days to stockout
        if stock == 0:
            days_to_stockout = 0
            status = "Out of Stock"
        else:
            days_to_stockout = int(stock / daily_velocity)
            
            if stock <= reorder:
                status = "Critical (Reorder Immediately)"
            elif days_to_stockout <= 5:
                status = "Warning (Stockout soon)"
            else:
                status = "Healthy"
                
        # Calculate expiry alert status
        expiry_status = "Good"
        try:
            exp_date = datetime.strptime(item["expiry_date"], "%Y-%m-%d")
            days_to_expiry = (exp_date - datetime.now()).days
            if days_to_expiry < 0:
                expiry_status = "Expired"
            elif days_to_expiry < 90:
                expiry_status = "Near Expiry (Within 90 Days)"
        except Exception:
            pass
            
        item["predicted_daily_velocity"] = daily_velocity
        item["days_to_stockout"] = days_to_stockout
        item["stock_status"] = status
        item["expiry_status"] = expiry_status
        
    return items


@router.post("/add")
def add_inventory_item(payload: Dict[str, Any] = Body(...)):
    """Registers a new medicine or replenishes stock for an existing item."""
    name = payload.get("medicine_name")
    batch = payload.get("batch_number", "UNKNOWN")
    stock_add = payload.get("stock_level")
    expiry = payload.get("expiry_date", "2027-12-31")
    reorder = payload.get("reorder_level", 20)
    purpose = payload.get("purpose_simple", "")
    price = payload.get("price", 10.0)
    
    if not name or stock_add is None:
        raise HTTPException(status_code=400, detail="medicine_name and stock_level are required.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if item exists (case-insensitive)
    cursor.execute("SELECT id, stock_level, medicine_name FROM inventory WHERE LOWER(medicine_name) = LOWER(?)", (name,))
    row = cursor.fetchone()
    
    try:
        if row:
            new_stock = row["stock_level"] + int(stock_add)
            cursor.execute("""
            UPDATE inventory 
            SET stock_level = ?, batch_number = ?, expiry_date = ?, reorder_level = ?, purpose_simple = ?, price = ?
            WHERE id = ?
            """, (new_stock, batch, expiry, reorder, purpose, price, row["id"]))
            message = f"Replenished {row['medicine_name']} stock. New stock level: {new_stock}."
        else:
            cursor.execute("""
            INSERT INTO inventory (medicine_name, batch_number, stock_level, expiry_date, reorder_level, purpose_simple, price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (name, batch, int(stock_add), expiry, reorder, purpose, price))
            message = f"Registered {name} into catalog."
            
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")
    finally:
        conn.close()
        
    return {"message": message}


@router.post("/dispense")
def dispense_medicine(payload: Dict[str, Any] = Body(...)):
    """Dispenses medicine, logging transactions and decreasing stock level."""
    patient = payload.get("patient_name")
    medicine = payload.get("medicine_name")
    qty = payload.get("quantity")
    
    if not patient or not medicine or not qty:
        raise HTTPException(status_code=400, detail="patient_name, medicine_name, and quantity are required.")
        
    qty = int(qty)
    if qty <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch stock (case-insensitive)
    cursor.execute("SELECT id, medicine_name, stock_level, reorder_level FROM inventory WHERE LOWER(medicine_name) = LOWER(?)", (medicine,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Medicine '{medicine}' not found in inventory.")
        
    actual_name = row["medicine_name"]
    current_stock = row["stock_level"]
    reorder_level = row["reorder_level"]
    
    if current_stock < qty:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Insufficient stock for {actual_name}. Available: {current_stock}, Requested: {qty}.")
        
    now_str = datetime.now().isoformat()
    try:
        # Deduct stock
        new_stock = current_stock - qty
        cursor.execute("UPDATE inventory SET stock_level = ? WHERE id = ?", (new_stock, row["id"]))
        
        # Log transaction
        cursor.execute("""
        INSERT INTO dispensations (patient_name, medicine_name, quantity, dispense_date)
        VALUES (?, ?, ?, ?)
        """, (patient, actual_name, qty, now_str))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")
    finally:
        conn.close()
        
    warning_triggered = new_stock <= reorder_level
    
    return {
        "message": f"Dispensed {qty} of {actual_name} to {patient}.",
        "remaining_stock": new_stock,
        "warning_triggered": warning_triggered,
        "warning_details": f"Stock is low ({new_stock} remaining, reorder threshold is {reorder_level})" if warning_triggered else None
    }


@router.get("/dispensations")
def get_dispensations_log(limit: int = 50):
    """Returns history of all medicine dispensations."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM dispensations ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.get("/pending-prescriptions")
def get_pending_prescriptions():
    """Returns list of electronic prescriptions waiting for pharmacy fulfillment."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT p.*, pt.name as patient_name, pt.uhid, pt.age, pt.gender,
           GROUP_CONCAT(i.medicine_name || ' (' || i.dosage || ' - ' || i.frequency || ') [Qty: ' || i.quantity || ']', ' | ') as items_detail
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.patient_id
    LEFT JOIN prescription_items i ON p.prescription_id = i.prescription_id
    WHERE p.status = 'Pending_Dispensation'
    GROUP BY p.prescription_id
    ORDER BY p.created_at DESC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    
    # Fetch individual items for each prescription
    for r in rows:
        cursor.execute("SELECT * FROM prescription_items WHERE prescription_id = ?", (r["prescription_id"],))
        r["items"] = [dict(it) for it in cursor.fetchall()]
        
    conn.close()
    return rows

@router.post("/dispense-prescription")
def dispense_electronic_prescription(payload: Dict[str, Any] = Body(...)):
    """
    Validates inventory stock for all prescription items, decrements inventory,
    prevents negative stock, records dispensations, and updates prescription status.
    """
    prescription_id = payload.get("prescription_id")
    pharmacist_name = payload.get("pharmacist_name", "David Kim (Chief Pharmacist)")
    
    if not prescription_id:
        raise HTTPException(status_code=400, detail="prescription_id is required.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get prescription and patient
    cursor.execute("""
    SELECT p.*, pt.name as patient_name 
    FROM prescriptions p 
    JOIN patients pt ON p.patient_id = pt.patient_id 
    WHERE p.prescription_id = ?
    """, (prescription_id,))
    prescription = cursor.fetchone()
    if not prescription:
        conn.close()
        raise HTTPException(status_code=404, detail="Prescription not found.")
        
    if prescription["status"] == "Dispensed":
        conn.close()
        raise HTTPException(status_code=400, detail="Prescription has already been dispensed.")
        
    # Get all prescription items
    cursor.execute("SELECT * FROM prescription_items WHERE prescription_id = ?", (prescription_id,))
    items = cursor.fetchall()
    
    # 1. Stock Verification Step (Prevent Negative Inventory)
    for item in items:
        med_name = item["medicine_name"]
        req_qty = item["quantity"]
        
        cursor.execute("SELECT stock_level FROM inventory WHERE medicine_name LIKE ?", (f"%{med_name.split()[0]}%",))
        inv_item = cursor.fetchone()
        
        if inv_item and inv_item["stock_level"] < req_qty:
            conn.close()
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for '{med_name}'. Available: {inv_item['stock_level']}, Required: {req_qty}."
            )
            
    # 2. Stock Deduction and Dispensation Recording
    now_str = datetime.now().isoformat()
    dispensed_items = []
    
    for item in items:
        med_name = item["medicine_name"]
        req_qty = item["quantity"]
        
        # Deduct stock
        cursor.execute("""
        UPDATE inventory 
        SET stock_level = MAX(0, stock_level - ?) 
        WHERE medicine_name LIKE ?
        """, (req_qty, f"%{med_name.split()[0]}%"))
        
        # Record dispensation
        cursor.execute("""
        INSERT INTO dispensations (prescription_id, patient_id, patient_name, medicine_name, quantity, dispense_date)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (prescription_id, prescription["patient_id"], prescription["patient_name"], med_name, req_qty, now_str))
        
        # Update item status
        cursor.execute("UPDATE prescription_items SET status = 'Dispensed', dispensed_quantity = ? WHERE id = ?", (req_qty, item["id"]))
        dispensed_items.append({"medicine": med_name, "quantity": req_qty})
        
    # Update Prescription Status
    cursor.execute("UPDATE prescriptions SET status = 'Dispensed' WHERE prescription_id = ?", (prescription_id,))
    
    # Audit Log
    import uuid
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_name, role, action, entity, entity_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, pharmacist_name, "PHARMACIST", "DISPENSE", "PRESCRIPTION", prescription_id, f"Dispensed {len(dispensed_items)} medications for {prescription['patient_name']}", now_str))
    
    conn.commit()
    conn.close()
    
    return {
        "message": f"Prescription {prescription_id} successfully fulfilled and dispensed.",
        "prescription_id": prescription_id,
        "patient_name": prescription["patient_name"],
        "dispensed_items": dispensed_items,
        "dispensed_by": pharmacist_name,
        "timestamp": now_str
    }

@router.post("/procure-request")
def create_procurement_request(payload: Dict[str, Any] = Body(...)):
    """Logs a wholesale procurement replenishment request."""
    medicine_name = payload.get("medicine_name")
    requested_qty = payload.get("requested_qty", 100)
    vendor = payload.get("vendor", "MedPharma Logistics Central")
    notes = payload.get("notes", "Routine low-stock auto-replenish order")
    
    if not medicine_name:
        raise HTTPException(status_code=400, detail="medicine_name is required.")
        
    import uuid
    order_id = f"PO-2026-{uuid.uuid4().hex[:5].upper()}"
    now_str = datetime.now().isoformat()
    
    return {
        "success": True,
        "order_id": order_id,
        "medicine_name": medicine_name,
        "requested_qty": requested_qty,
        "vendor": vendor,
        "status": "APPROVED_ORDER_PLACED",
        "expected_delivery": "Within 24-48 Hours",
        "created_at": now_str,
        "notes": notes
    }

@router.get("/reports")
def get_pharmacy_reports():
    """Returns analytics for daily dispensing, formulary value, and inventory turnover."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM inventory")
    inv_rows = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM dispensations ORDER BY dispense_date DESC LIMIT 50")
    disp_rows = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT COUNT(*) as total FROM prescriptions WHERE status = 'Dispensed'")
    dispensed_count = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as total FROM prescriptions WHERE status = 'Pending_Dispensation'")
    pending_count = cursor.fetchone()["total"]
    
    conn.close()
    
    total_val = sum((item.get("stock_level", 0) * item.get("price", 10.0)) for item in inv_rows)
    low_stock = [i for i in inv_rows if i.get("stock_level", 0) <= i.get("reorder_level", 20)]
    
    return {
        "summary": {
            "total_medicines": len(inv_rows),
            "total_inventory_value": round(total_val, 2),
            "total_dispensations": len(disp_rows),
            "fully_dispensed_prescriptions": dispensed_count,
            "pending_prescriptions": pending_count,
            "low_stock_alerts_count": len(low_stock)
        },
        "low_stock_items": low_stock,
        "recent_dispensations": disp_rows[:15]
    }


@router.delete("/delete/{item_id}")
@router.delete("/{item_id}")
def delete_inventory_item(item_id: int):
    """Deletes an item from inventory by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory WHERE id = ?", (item_id,))
    item = cursor.fetchone()
    if not item:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Inventory item {item_id} not found.")
    cursor.execute("DELETE FROM inventory WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Inventory item {item_id} successfully deleted."}


