const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const initDatabase = async () => {
  let connection;
  try {
    console.log('🔄 Connecting to MySQL server to initialize database...');

    // 1. Initial connection without database specified
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    const dbName = process.env.DB_NAME || 'expense_voucher_db';

    // 2. Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' created or already exists.`);

    await connection.query(`USE \`${dbName}\`;`);

    // 3. Create Tables
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('Employee', 'Director', 'Accounts') NOT NULL DEFAULT 'Employee',
        \`department\` VARCHAR(100) NOT NULL,
        \`employee_id\` VARCHAR(50) NOT NULL UNIQUE,
        \`signature_path\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_users_role\` (\`role\`),
        INDEX \`idx_users_department\` (\`department\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const createVouchersTable = `
      CREATE TABLE IF NOT EXISTS \`vouchers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`voucher_number\` VARCHAR(50) NOT NULL UNIQUE,
        \`voucher_date\` DATE NOT NULL,
        \`expense_date\` DATE NOT NULL,
        \`department\` VARCHAR(100) NOT NULL,
        \`expense_title\` VARCHAR(200) NOT NULL,
        \`expense_category\` VARCHAR(100) NOT NULL,
        \`expense_description\` TEXT DEFAULT NULL,
        \`amount\` DECIMAL(12, 2) NOT NULL CHECK (\`amount\` > 0),
        \`user_id\` INT NOT NULL,
        \`employee_name\` VARCHAR(100) NOT NULL,
        \`employee_id\` VARCHAR(50) NOT NULL,
        \`employee_signature_path\` VARCHAR(255) DEFAULT NULL,
        \`status\` ENUM('Draft', 'Submitted', 'Pending Approval', 'Approved', 'Rejected') NOT NULL DEFAULT 'Draft',
        \`director_signature_path\` VARCHAR(255) DEFAULT NULL,
        \`approval_date\` DATETIME DEFAULT NULL,
        \`rejection_reason\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        INDEX \`idx_vouchers_status\` (\`status\`),
        INDEX \`idx_vouchers_user_id\` (\`user_id\`),
        INDEX \`idx_vouchers_dept\` (\`department\`),
        INDEX \`idx_vouchers_category\` (\`expense_category\`),
        INDEX \`idx_vouchers_voucher_number\` (\`voucher_number\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const createLogsTable = `
      CREATE TABLE IF NOT EXISTS \`voucher_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`voucher_id\` INT NOT NULL,
        \`action\` VARCHAR(50) NOT NULL,
        \`performed_by_id\` INT NOT NULL,
        \`performed_by_name\` VARCHAR(100) NOT NULL,
        \`performed_by_role\` VARCHAR(50) NOT NULL,
        \`remarks\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`voucher_id\`) REFERENCES \`vouchers\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`performed_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createUsersTable);
    console.log('✅ Table `users` created or verified.');

    await connection.query(createVouchersTable);
    console.log('✅ Table `vouchers` created or verified.');

    await connection.query(createLogsTable);
    console.log('✅ Table `voucher_logs` created or verified.');

    // 4. Seed Seed Users if not present
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    const defaultUsers = [
      { full_name: 'John Doe (Employee)', email: 'employee@company.com', password: hashedPassword, role: 'Employee', department: 'Engineering', employee_id: 'EMP-1001' },
      { full_name: 'Jane Smith (Employee)', email: 'jane.smith@company.com', password: hashedPassword, role: 'Employee', department: 'Marketing', employee_id: 'EMP-1002' },
      { full_name: 'Sarah Jenkins (Director)', email: 'director@company.com', password: hashedPassword, role: 'Director', department: 'Executive Management', employee_id: 'DIR-1001' },
      { full_name: 'Robert Chen (Accounts)', email: 'accounts@company.com', password: hashedPassword, role: 'Accounts', department: 'Finance & Accounts', employee_id: 'ACC-1001' }
    ];

    for (const u of defaultUsers) {
      const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO users (full_name, email, password, role, department, employee_id) VALUES (?, ?, ?, ?, ?, ?)',
          [u.full_name, u.email, u.password, u.role, u.department, u.employee_id]
        );
        console.log(`👤 Seed user created: ${u.email} (${u.role})`);
      }
    }

    // 5. Seed Sample Vouchers for testing
    const [empUser] = await connection.query('SELECT id FROM users WHERE email = ?', ['employee@company.com']);
    if (empUser.length > 0) {
      const userId = empUser[0].id;
      const [existingVouchers] = await connection.query('SELECT id FROM vouchers WHERE user_id = ?', [userId]);

      if (existingVouchers.length === 0) {
        const sampleVouchers = [
          {
            voucher_number: 'VOU-2026-0001',
            voucher_date: '2026-07-25',
            expense_date: '2026-07-24',
            department: 'Engineering',
            expense_title: 'AWS Cloud Server Hosting Fees',
            expense_category: 'IT Infrastructure',
            expense_description: 'Monthly production AWS infrastructure hosting and database backups',
            amount: 450.00,
            status: 'Approved',
            approval_date: '2026-07-26 10:30:00'
          },
          {
            voucher_number: 'VOU-2026-0002',
            voucher_date: '2026-07-28',
            expense_date: '2026-07-27',
            department: 'Engineering',
            expense_title: 'Client Lunch & Technical Review',
            expense_category: 'Meals & Entertainment',
            expense_description: 'Lunch meeting with Enterprise client team to finalize system deployment schedule',
            amount: 125.50,
            status: 'Pending Approval',
            approval_date: null
          },
          {
            voucher_number: 'VOU-2026-0003',
            voucher_date: '2026-07-29',
            expense_date: '2026-07-28',
            department: 'Engineering',
            expense_title: 'Office Ergonomic Chair',
            expense_category: 'Office Supplies',
            expense_description: 'Ergonomic lumbar support desk chair purchase',
            amount: 220.00,
            status: 'Draft',
            approval_date: null
          },
          {
            voucher_number: 'VOU-2026-0004',
            voucher_date: '2026-07-20',
            expense_date: '2026-07-19',
            department: 'Engineering',
            expense_title: 'Taxi Fares for Client Visit',
            expense_category: 'Travel & Transport',
            expense_description: 'Uber rides to downtown client headquarters',
            amount: 65.00,
            status: 'Rejected',
            rejection_reason: 'Missing itemized receipt. Please attach original digital receipt and resubmit.',
            approval_date: null
          }
        ];

        for (const v of sampleVouchers) {
          await connection.query(
            `INSERT INTO vouchers 
            (voucher_number, voucher_date, expense_date, department, expense_title, expense_category, expense_description, amount, user_id, employee_name, employee_id, status, approval_date, rejection_reason) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              v.voucher_number, v.voucher_date, v.expense_date, v.department, v.expense_title, v.expense_category,
              v.expense_description, v.amount, userId, 'John Doe (Employee)', 'EMP-1001', v.status, v.approval_date, v.rejection_reason
            ]
          );
        }
        console.log('📄 Sample vouchers inserted for Employee John Doe');
      }
    }

    console.log('✨ MySQL Database Initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    if (connection) await connection.end();
  }
};

// Execute if run directly from CLI
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
