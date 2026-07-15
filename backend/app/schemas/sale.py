from datetime import datetime

from pydantic import BaseModel, Field


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)


class SaleItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class SaleCreate(BaseModel):
    items: list[SaleItemCreate] = Field(min_length=1)


class SaleOut(BaseModel):
    id: int
    created_at: datetime
    items: list[SaleItemOut]

    class Config:
        from_attributes = True