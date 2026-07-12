from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_products: int
    total_categories: int
    total_suppliers: int
    total_stock_units: int
    total_stock_value: float
    low_stock_count: int
    total_purchases: int
    total_sales: int
    total_purchase_cost: float
    total_revenue: float


class LowStockProduct(BaseModel):
    id: int
    sku: str
    name: str
    stock_quantity: int
    category_id: int

    class Config:
        from_attributes = True


class TopProduct(BaseModel):
    product_id: int
    name: str
    sku: str
    total_quantity_sold: int
    total_revenue: float