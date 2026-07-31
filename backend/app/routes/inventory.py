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


@router.delete("/delete/{item_id}")
def delete_inventory_item(item_id: int):
    """Deletes an item from inventory catalog by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT medicine_name FROM inventory WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Inventory item not found.")
        
    med_name = row["medicine_name"]
    try:
        cursor.execute("DELETE FROM inventory WHERE id = ?", (item_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database delete error: {str(e)}")
    finally:
        conn.close()
        
    return {"message": f"Medicine '{med_name}' (ID: {item_id}) deleted from catalog successfully."}

