# 📦 Inventory Management System

A full-stack **Inventory Management System** built with **FastAPI**, **PostgreSQL**, and **React**. This project is designed to help businesses manage products, categories, suppliers, inventory, purchases, and sales efficiently through a secure REST API and modern web interface.

This project is being developed following real-world software engineering practices, including modular architecture, version control, clean code principles, and RESTful API design.

---

# 🚀 Features

## Authentication & Authorization
- JWT Authentication
- Secure Password Hashing (bcrypt)
- Role-Based Access Control (Admin, Manager, Staff)
- Protected API Routes

## User Management
- User Registration
- User Login
- View User Profile
- Update User Profile
- Manage User Roles

## Category Management
- Create Categories
- View Categories
- Update Categories
- Delete Categories

## Product Management
- Add Products
- Update Product Information
- Delete Products
- Product Search
- SKU Management
- Stock Tracking

## Supplier Management
- Add Suppliers
- Update Supplier Information
- Delete Suppliers
- Supplier Listing

## Purchase Management
- Record Purchases
- Purchase Items
- Automatic Stock Increment

## Sales Management
- Record Sales
- Sale Items
- Automatic Stock Deduction

## Inventory
- Current Stock Levels
- Low Stock Alerts
- Inventory Reports

## Dashboard
- Total Products
- Total Categories
- Total Suppliers
- Total Sales
- Total Purchases
- Stock Summary

---

# 🛠 Tech Stack

## Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Alembic
- Pydantic
- JWT Authentication
- Passlib (bcrypt)

## Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS

## Database
- PostgreSQL

## Development Tools
- Git
- GitHub
- VS Code
- Postman

---

# 📂 Project Structure

```
inventory-management-system/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── dependencies/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│
├── docs/
│
├── .gitignore
└── README.md
```

---

# 🗄 Database Entities

- Users
- Categories
- Products
- Suppliers
- Purchases
- Purchase Items
- Sales
- Sale Items

---

# 🔗 Entity Relationships

- One Category → Many Products
- One Supplier → Many Purchases
- One Purchase → Many Purchase Items
- One Product → Many Purchase Items
- One Sale → Many Sale Items
- One Product → Many Sale Items

---

# 🔐 User Roles

| Role | Permissions |
|-------|-------------|
| Admin | Full system access |
| Manager | Manage inventory, purchases, and sales |
| Staff | Limited inventory operations |

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/studyhaxer/inventory-management-system.git
```

```
cd inventory-management-system
```

---

## Backend Setup

Create virtual environment

```bash
python -m venv venv
```

Activate virtual environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

# Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=postgresql://username:password@localhost/inventory_db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# Run the Backend

```bash
uvicorn app.main:app --reload
```

Server

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

Redoc

```
http://127.0.0.1:8000/redoc
```

---

# 🗺 Development Roadmap

## Phase 1
- [x] Project Setup
- [x] Database Design
- [x] PostgreSQL Configuration
- [x] SQLAlchemy Setup

## Phase 2
- [ ] User Authentication
- [ ] JWT Login
- [ ] Role-Based Authorization

## Phase 3
- [ ] Category Module

## Phase 4
- [ ] Product Module

## Phase 5
- [ ] Supplier Module

## Phase 6
- [ ] Purchase Module

## Phase 7
- [ ] Sales Module

## Phase 8
- [ ] Inventory Reports

## Phase 9
- [ ] Dashboard APIs

## Phase 10
- [ ] React Frontend

---

# 📖 API Documentation

Interactive API documentation is available after running the server.

Swagger UI

```
/docs
```

ReDoc

```
/redoc
```

---

# 🧪 Testing

API testing will be performed using:

- Swagger UI
- Postman

---

# 📈 Future Improvements

- Barcode Scanner Support
- Image Upload for Products
- Export Reports (PDF/Excel)
- Email Notifications
- Audit Logs
- Docker Deployment
- CI/CD Pipeline
- Unit & Integration Testing

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/your-feature
```

5. Create a Pull Request

---

# 👨‍💻 Author

**Hafiz Atta Ur Rahman**

Backend Developer | Python | FastAPI | React

GitHub:
> GitHub: https://github.com/studyhaxer

LinkedIn:
> LinkedIn: https://linkedin.com/in/studyhaxer

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ Project Status

🚧 **Currently Under Active Development**

This project is being developed incrementally following a structured internship-style roadmap. New features and improvements are added daily as part of the learning and development process.