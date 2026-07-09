from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.jwt import decode_access_token

bearer_scheme = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


def require_role(role: str):
    def checker(user=Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker