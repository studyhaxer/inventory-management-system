from pydantic import BaseModel, Field


class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)


class PurchaseItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class PurchaseCreate(BaseModel):
    supplier_id: int
    items: list[PurchaseItemCreate] = Field(min_length=1)


class PurchaseOut(BaseModel):
    id: int
    supplier_id: int
    items: list[PurchaseItemOut]

    class Config:
        from_attributes = True