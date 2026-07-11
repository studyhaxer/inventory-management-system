from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models.sale import Sale, SaleItem
from models.product import Product
from schemas.sale import SaleCreate, SaleOut
from dependencies.auth import require_role

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("", response_model=list[SaleOut])
def list_sales(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return db.query(Sale).order_by(Sale.id.desc()).offset(skip).limit(limit).all()


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.post("", response_model=SaleOut, status_code=201)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    products = {
        p.id: p for p in db.query(Product)
        .filter(Product.id.in_([item.product_id for item in payload.items]))
        .all()
    }
    missing = [item.product_id for item in payload.items if item.product_id not in products]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown product_id(s): {missing}")

    insufficient = [
        item.product_id for item in payload.items
        if products[item.product_id].stock_quantity < item.quantity
    ]
    if insufficient:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock for product_id(s): {insufficient}",
        )

    try:
        sale = Sale()
        db.add(sale)
        db.flush()

        for item in payload.items:
            db.add(SaleItem(
                sale_id=sale.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
            ))
            products[item.product_id].stock_quantity -= item.quantity

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Sale could not be recorded")

    db.refresh(sale)
    return sale