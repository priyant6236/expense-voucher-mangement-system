const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

// Pre-hashed default password for 'Password@123' used in demo memory store fallback
const DEMO_HASHED_PASSWORD = bcrypt.hashSync('Password@123', 10);

// In-Memory fallback store to ensure seamless development experience
const memoryUsers = [
  {
    id: 1,
    full_name: 'John Doe (Employee)',
    email: 'employee@company.com',
    password: DEMO_HASHED_PASSWORD,
    role: 'Employee',
    department: 'Engineering',
    employee_id: 'EMP-1001',
    signature_path: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    full_name: 'Sarah Jenkins (Director)',
    email: 'director@company.com',
    password: DEMO_HASHED_PASSWORD,
    role: 'Director',
    department: 'Executive Management',
    employee_id: 'DIR-1001',
    signature_path: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    full_name: 'Robert Chen (Accounts)',
    email: 'accounts@company.com',
    password: DEMO_HASHED_PASSWORD,
    role: 'Accounts',
    department: 'Finance & Accounts',
    employee_id: 'ACC-1001',
    signature_path: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

class UserModel {
  /**
   * Find user by email address
   */
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
      const rows = await query(sql, [email.toLowerCase().trim()]);
      if (rows && rows.length > 0) return rows[0];
    } catch (error) {
      console.warn('Falling back to memory store for findByEmail:', email);
    }
    // Fallback to memory store
    return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  /**
   * Find user by primary key ID
   */
  static async findById(id) {
    try {
      const sql = 'SELECT id, full_name, email, role, department, employee_id, signature_path, created_at FROM users WHERE id = ? LIMIT 1';
      const rows = await query(sql, [id]);
      if (rows && rows.length > 0) return rows[0];
    } catch (error) {
      console.warn('Falling back to memory store for findById:', id);
    }
    const u = memoryUsers.find(user => user.id === parseInt(id));
    if (!u) return null;
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  }

  /**
   * Find user by unique employee ID
   */
  static async findByEmployeeId(employeeId) {
    try {
      const sql = 'SELECT id FROM users WHERE employee_id = ? LIMIT 1';
      const rows = await query(sql, [employeeId]);
      if (rows && rows.length > 0) return rows[0];
    } catch (error) {
      console.warn('Falling back to memory store for findByEmployeeId:', employeeId);
    }
    return memoryUsers.find(u => u.employee_id === employeeId) || null;
  }

  /**
   * Create a new user record
   */
  static async createUser({ full_name, email, password, role = 'Employee', department, employee_id }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const sql = `
        INSERT INTO users (full_name, email, password, role, department, employee_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = await query(sql, [full_name, normalizedEmail, hashedPassword, role, department, employee_id]);
      
      return {
        id: result.insertId,
        full_name,
        email: normalizedEmail,
        role,
        department,
        employee_id
      };
    } catch (error) {
      console.warn('Creating user in memory fallback store due to DB connection notice');
      const newUser = {
        id: memoryUsers.length + 1,
        full_name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        department,
        employee_id,
        signature_path: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      memoryUsers.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }
  }

  /**
   * Update user signature image path
   */
  static async updateSignature(userId, signaturePath) {
    try {
      const sql = 'UPDATE users SET signature_path = ? WHERE id = ?';
      await query(sql, [signaturePath, userId]);
    } catch (error) {
      const u = memoryUsers.find(user => user.id === parseInt(userId));
      if (u) u.signature_path = signaturePath;
    }
  }

  /**
   * Verify password candidate against stored bcrypt hash
   */
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = UserModel;
