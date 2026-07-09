from pydantic import BaseModel, EmailStr, Field


class SupplierBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    contact_email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    contact_email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)


class SupplierOut(SupplierBase):
    id: int

    class Config:
        from_attributes = True