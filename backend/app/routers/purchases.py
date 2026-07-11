from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models.purchase import Purchase, PurchaseItem
from models.product import Product
from models.supplier import Supplier
from schemas.purchase import PurchaseCreate, PurchaseOut
from dependencies.auth import require_role

router = APIRouter(prefix="/purchases", tags=["purchases"])


@router.get("", response_model=list[PurchaseOut])
def list_purchases(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return db.query(Purchase).order_by(Purchase.id.desc()).offset(skip).limit(limit).all()


@router.get("/{purchase_id}", response_model=PurchaseOut)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase


@router.post("", response_model=PurchaseOut, status_code=201)
def create_purchase(
    payload: PurchaseCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    supplier = db.query(Supplier).filter(Supplier.id == payload.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=400, detail="supplier_id does not reference an existing supplier")

    products = {
        p.id: p for p in db.query(Product)
        .filter(Product.id.in_([item.product_id for item in payload.items]))
        .all()
    }
    missing = [item.product_id for item in payload.items if item.product_id not in products]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown product_id(s): {missing}")

    try:
        purchase = Purchase(supplier_id=payload.supplier_id)
        db.add(purchase)
        db.flush()  # assigns purchase.id without ending the transaction

        for item in payload.items:
            db.add(PurchaseItem(
                purchase_id=purchase.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
            ))
            products[item.product_id].stock_quantity += item.quantity

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Purchase could not be recorded")

    db.refresh(purchase)
    return purchase