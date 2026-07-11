from fastapi import FastAPI
from database import Base, engine
import models  # noqa: F401
from routers import auth, categories, suppliers, products, purchases

app = FastAPI()

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(purchases.router)