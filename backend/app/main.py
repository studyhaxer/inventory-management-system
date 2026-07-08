from fastapi import FastAPI
from database import Base, engine
import models  # noqa: F401 -- ensures all models register on Base.metadata
from routers import auth

app = FastAPI()

app.include_router(auth.router)