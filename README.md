# Expense Voucher Management System

A production-quality full-stack web application that streamlines the expense reimbursement process within an organization. The system enables employees to submit expense vouchers, directors to review and approve requests, and the accounts team to manage approved reimbursements through a secure role-based workflow.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat&logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens)

---

## Overview

The Expense Voucher Management System replaces the traditional paper-based reimbursement process with a secure digital workflow.

The application supports three different user roles:

- **Employee** – Create, edit, submit and track expense vouchers.
- **Director** – Review, approve or reject submitted vouchers.
- **Accounts Team** – Verify approved vouchers and manage reimbursement records.

---

## Key Features

### Employee
- Secure Login & Registration
- Create and submit expense vouchers
- Save vouchers as drafts
- Edit/Delete draft vouchers
- Track voucher status
- Upload digital signature

### Director
- Dashboard with approval statistics
- Review pending vouchers
- Approve or reject requests
- Add approval signature
- View organization-wide vouchers

### Accounts Team
- Dashboard with financial overview
- View approved vouchers
- Search and filter records
- Verify signatures
- Print approved vouchers

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Express Validator
- Multer

### Database
- MySQL

### Development Tools
- Git
- GitHub
- Visual Studio Code
- npm

---

## Project Structure

```
expense-voucher-management-system
│
├── backend
│
├── frontend
│
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/expense-voucher-management-system.git
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file and configure:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_voucher_db

JWT_SECRET=your_secret_key
```

Initialize the database

```bash
node config/initDb.js
```

Start backend

```bash
npm start
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Application runs at

```
http://localhost:3000
```

---

## Demo Login

| Role | Email |
|------|-------|
| Employee | employee@company.com |
| Director | director@company.com |
| Accounts | accounts@company.com |

**Password**

```
Password@123
```

---

## Security Features

- JWT Authentication
- Password hashing using bcrypt
- Role-Based Access Control
- Input Validation
- Secure SQL Queries
- Protected API Routes

---

## Screenshots

- Employee Registration
  <img width="1919" height="1029" alt="image" src="https://github.com/user-attachments/assets/954c7db6-ce3e-4b20-8c4c-2b46c96a993a" />

- Login Page
  <img width="1919" height="1023" alt="image" src="https://github.com/user-attachments/assets/7f925270-93d2-4a6f-8211-47e1b5149cbe" />

- Employee Dashboard
  <img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/e0c2f6fb-3eee-412d-8fae-31a3414f7a51" />

- Director Dashboard
  <img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/b5eb2151-b8b5-4cb1-845a-1459e27bce52" />

- Accounts Dashboard
  <img width="1919" height="1029" alt="image" src="https://github.com/user-attachments/assets/77cb44f6-0ed2-43df-8c4c-631d650007bf" />

- Voucher Form
  <img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/a40780cc-43d3-4666-a17c-a8651dd67eb8" />


---

## Future Enhancements

- Email Notifications
- Export Reports (PDF/Excel)
- Analytics Dashboard
- Multi-Level Approval Workflow
- Cloud Storage Integration

---

## Author

**Priyant Dharwarkar**

B.Tech Computer Science Engineering (Artificial Intelligence & Data Science)

---

## License

Developed as part of a Full Stack Development internship assignment for educational and portfolio purposes.
