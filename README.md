# PL Soft Tech Solutions - CRM Software

A modern, scalable Customer Relationship Management (CRM) platform designed to streamline lead management, customer interactions, sales pipelines, quotation generation, task tracking, and analytics.

---

## Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.10+, Django 5.x, Django REST Framework (DRF)
- **Database**: MySQL 8.x
- **Authentication**: JWT (JSON Web Tokens via `djangorestframework-simplejwt`)
- **CI/CD**: GitHub Actions

---

## Project Structure

```text
crm-project/
├── backend/                  # Django backend project & REST APIs
│   ├── crm_core/              # Core project settings, urls, wsgi
│   └── apps/                 # Modular Django apps
│       ├── leads/            # Lead tracking and conversion
│       ├── customers/        # Customer database & accounts
│       ├── opportunities/    # Deal pipeline & stages
│       ├── quotations/       # Quotation generation & invoicing
│       ├── products/         # Product / service catalogue & pricing
│       ├── tasks/            # Task management & follow-ups
│       ├── reports/          # Analytics & reporting endpoints
│       └── users/            # Custom user model & JWT auth
├── frontend/                  # React + Vite frontend application
│   └── src/
│       ├── modules/          # Feature-based module components
│       │   ├── leads/
│       │   ├── customers/
│       │   ├── opportunities/
│       │   ├── quotations/
│       │   ├── products/
│       │   ├── tasks/
│       │   └── reports/
│       └── shared/           # Common components, hooks, and services
├── docs/                     # Project specifications & module checklists
│   ├── quotation.md
│   └── module-checklist.md
├── .github/
│   └── workflows/
│       └── ci.yml            # CI workflow for backend & frontend
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python**: 3.14 or higher
- **Node.js**: 18.x or higher & npm
- **MySQL**: 8.x (or MariaDB)
- **Git**

---

### Backend Setup (Django + DRF)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create the MySQL Database**:
   ```sql
   CREATE DATABASE crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Set up environment variables**:
   Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```bash
   cp .env.example .env
   ```

6. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

7. **Create a superuser**:
   ```bash
   python manage.py createsuperuser
   ```

8. **Start the Django development server**:
   ```bash
   python manage.py runserver
   ```
   The backend API will be available at `http://127.0.0.1:8000/`.

---

### Frontend Setup (React + Vite)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   Create a `.env` file if you need custom API URLs:
   ```bash
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:5173/`.

---

## Running Tests & CI Checks

### Backend Checks
```bash
cd backend
flake8 .
python manage.py test
```

### Frontend Build
```bash
cd frontend
npm run build
```

---

## Documentation

- [CRM Modules Checklist](docs/module-checklist.md)
- [Quotation System Specification](docs/quotation.md)

---

## License

Proprietary - PL Soft Tech Solutions. All Rights Reserved.
