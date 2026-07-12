# 📦 Inventory Management System

A full-stack **Inventory Management System** built with **FastAPI**, **PostgreSQL**, and **React**. This project is designed to help businesses manage products, categories, suppliers, inventory, purchases, and sales efficiently through a secure REST API and modern web interface.

This project is being developed following real-world software engineering practices, including modular architecture, version control, clean code principles, and RESTful API design.

---

## 🚀 Features

### Authentication & Authorization
- JWT Authentication
- Secure Password Hashing (bcrypt)
- Role-Based Access Control (Admin, Manager, Staff)
- Protected API Routes

### User Management
- User Registration
- User Login
- View User Profile
- Update User Profile
- Manage User Roles

### Category Management
- Create Categories
- View Categories (with search & pagination)
- Update Categories
- Delete Categories

### Product Management
- Add Products
- View Products (search, filter by category/price/stock, pagination)
- Update Product Information
- Delete Products
- Unique SKU Enforcement
- Category Reference Validation

### Supplier Management
- Add Suppliers
- View Suppliers (with search & pagination)
- Update Supplier Information
- Delete Suppliers

### Purchase Management
- Record Purchases (with one or more line items)
- Purchase Items
- Automatic Stock Increment (atomic transaction per request)
- Supplier & Product Reference Validation

### Sales Management
- Record Sales (with one or more line items)
- Sale Items
- Automatic Stock Deduction (atomic transaction per request)
- Insufficient-Stock Rejection (whole sale rejected, no partial writes)

### Inventory *(planned)*
- Current Stock Levels
- Low Stock Alerts
- Inventory Reports

### Dashboard & Reports
- Store-Wide Summary (products, categories, suppliers, stock units, stock value, purchases, sales, revenue)
- Low-Stock Alerts (configurable threshold, sorted lowest first)
- Top-Selling Products (ranked by quantity sold, with revenue)

---

## 🛠 Tech Stack

### Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Alembic
- Pydantic
- JWT Authentication
- Passlib (bcrypt)

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Database
- PostgreSQL

### Development Tools
- Git
- GitHub
- VS Code
- Postman

---

## 📁 Project Structure

```
inventory-management-system/
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
│   ├── .env
│   └── requirements.txt
├── frontend/
├── docs/
├── .gitignore
└── README.md
```

---

## 🗄 Database Entities

- Users
- Categories
- Products
- Suppliers
- Purchases
- Purchase Items
- Sales
- Sale Items

## 🔗 Entity Relationships

- One Category → Many Products
- One Supplier → Many Purchases
- One Purchase → Many Purchase Items
- One Product → Many Purchase Items
- One Sale → Many Sale Items
- One Product → Many Sale Items

## 🔐 User Roles

| Role    | Permissions                          |
|---------|----------------------------------------|
| Admin   | Full system access                     |
| Manager | Manage inventory, purchases, and sales |
| Staff   | Limited inventory operations           |

---

## ⚙️ Installation

### Clone Repository
```bash
git clone https://github.com/studyhaxer/inventory-management-system.git
cd inventory-management-system
```

### Backend Setup

Create virtual environment
```bash
python -m venv venv
```

Activate virtual environment

**Windows**
```bash
venv\Scripts\activate
```

**Linux / macOS**
```bash
source venv/bin/activate
```

Install dependencies
```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file inside `backend/app/` (this is the path used by `docker-compose.yml` and `.gitignore`).
```
DATABASE_URL=postgresql://username:password@localhost/inventory_db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Run the Backend

**Locally**, from `backend/`:
```bash
uvicorn main:app --app-dir app --reload
```

**With Docker** (also starts PostgreSQL and the frontend), from the project root:
```bash
docker-compose up --build
```

- Server: `http://127.0.0.1:8000`
- Swagger Documentation: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 🗺 Development Roadmap

### Phase 1
- [x] Project Setup
- [x] Database Design
- [x] PostgreSQL Configuration
- [x] SQLAlchemy Setup

### Phase 2
- [x] User Authentication
- [x] JWT Login
- [x] Role-Based Authorization

### Phase 3
- [x] ERD-based SQLAlchemy models (Category, Product, Supplier, Purchase, PurchaseItem, Sale, SaleItem)
- [x] Alembic initialized and wired to Base.metadata
- [x] Initial migrations generated, reviewed, and applied to Supabase Postgres (core inventory tables + users table)
- [x] Category & Supplier CRUD endpoints
- [x] Request validation & search filtering

### Phase 4
- [x] Product CRUD endpoints (create, list, get, update, delete)
- [x] Filtering (category, price range, stock status) and search (name/SKU)
- [x] Pagination (skip/limit) matching Category/Supplier pattern
- [x] Unique SKU and category_id reference validation

### Phase 5
- [x] Supplier Module (completed under Phase 3 alongside Category Module)

### Phase 6
- [x] Purchase Module (schemas, CRUD endpoints, atomic stock increment, supplier/product validation)

### Phase 7
- [x] Sales Module (schemas, CRUD endpoints, atomic stock decrement, insufficient-stock rejection)

### Phase 8
- [ ] Inventory Reports

### Phase 9
- [x] Dashboard APIs (summary, low-stock, top-products endpoints with SQL aggregates)

### Phase 10
- [ ] React Frontend

---

## 📖 API Documentation

Interactive API documentation is available after running the server.

**Swagger UI**
```
/docs
```

**ReDoc**
```
/redoc
```

---

## 🧪 Testing

API testing will be performed using:
- Swagger UI
- Postman

---

## 📈 Future Improvements

- Barcode Scanner Support
- Image Upload for Products
- Export Reports (PDF/Excel)
- Email Notifications
- Audit Logs
- Docker Deployment
- CI/CD Pipeline
- Unit & Integration Testing

---

## 🤝 Contributing

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

## 👤 Author

**Hafiz Atta Ur Rahman**
Backend Developer | Python | FastAPI | React

- GitHub: https://github.com/studyhaxer
- LinkedIn: https://linkedin.com/in/studyhaxer

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Project Status

🚧 **Currently Under Active Development**

This project is being developed incrementally following a structured internship-style roadmap. New features and improvements are added daily as part of the learning and development process.