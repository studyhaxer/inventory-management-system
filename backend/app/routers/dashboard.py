from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.product import Product
from models.category import Category
from models.supplier import Supplier
from models.purchase import Purchase, PurchaseItem
from models.sale import Sale, SaleItem
from schemas.dashboard import DashboardSummary, LowStockProduct, TopProduct
from dependencies.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    low_stock_threshold: int = Query(default=10, ge=0),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    total_products = db.query(func.count(Product.id)).scalar()
    total_categories = db.query(func.count(Category.id)).scalar()
    total_suppliers = db.query(func.count(Supplier.id)).scalar()

    total_stock_units = db.query(
        func.coalesce(func.sum(Product.stock_quantity), 0)
    ).scalar()

    total_stock_value = db.query(
        func.coalesce(func.sum(Product.stock_quantity * Product.price), 0.0)
    ).scalar()

    low_stock_count = db.query(func.count(Product.id)).filter(
        Product.stock_quantity < low_stock_threshold
    ).scalar()

    total_purchases = db.query(func.count(Purchase.id)).scalar()
    total_sales = db.query(func.count(Sale.id)).scalar()

    total_purchase_cost = db.query(
        func.coalesce(func.sum(PurchaseItem.quantity * PurchaseItem.unit_price), 0.0)
    ).scalar()

    total_revenue = db.query(
        func.coalesce(func.sum(SaleItem.quantity * SaleItem.unit_price), 0.0)
    ).scalar()

    return DashboardSummary(
        total_products=total_products,
        total_categories=total_categories,
        total_suppliers=total_suppliers,
        total_stock_units=total_stock_units,
        total_stock_value=total_stock_value,
        low_stock_count=low_stock_count,
        total_purchases=total_purchases,
        total_sales=total_sales,
        total_purchase_cost=total_purchase_cost,
        total_revenue=total_revenue,
    )
    
@router.get("/low-stock", response_model=list[LowStockProduct])
def get_low_stock(
    threshold: int = Query(default=10, ge=0),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(Product)
        .filter(Product.stock_quantity < threshold)
        .order_by(Product.stock_quantity.asc())
        .all()
    )


@router.get("/top-products", response_model=list[TopProduct])
def get_top_products(
    limit: int = Query(default=5, ge=1, le=50),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    rows = (
        db.query(
            Product.id.label("product_id"),
            Product.name.label("name"),
            Product.sku.label("sku"),
            func.sum(SaleItem.quantity).label("total_quantity_sold"),
            func.sum(SaleItem.quantity * SaleItem.unit_price).label("total_revenue"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .group_by(Product.id, Product.name, Product.sku)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(limit)
        .all()
    )

    return [
        TopProduct(
            product_id=r.product_id,
            name=r.name,
            sku=r.sku,
            total_quantity_sold=int(r.total_quantity_sold),
            total_revenue=float(r.total_revenue),
        )
        for r in rows
    ]