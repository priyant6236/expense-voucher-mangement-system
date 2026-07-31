USE `expense_voucher_db`;

-- Standard sample seed users script
-- Note: Use backend/config/initDb.js to auto-initialize DB & insert bcrypt hashed passwords dynamically.

-- Employee Account (Password: Password@123)
-- Director Account (Password: Password@123)
-- Accounts Account (Password: Password@123)

INSERT IGNORE INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `department`, `employee_id`) VALUES
(1, 'John Doe (Employee)', 'employee@company.com', '$2a$10$wT0E4d.o2.wO0Z0w0O0O0u10a/10.10.10.10.10.10.10.10.10.', 'Employee', 'Engineering', 'EMP-1001'),
(2, 'Sarah Jenkins (Director)', 'director@company.com', '$2a$10$wT0E4d.o2.wO0Z0w0O0O0u10a/10.10.10.10.10.10.10.10.10.', 'Director', 'Management', 'DIR-1001'),
(3, 'Robert Chen (Accounts)', 'accounts@company.com', '$2a$10$wT0E4d.o2.wO0Z0w0O0O0u10a/10.10.10.10.10.10.10.10.10.', 'Accounts', 'Finance', 'ACC-1001');
