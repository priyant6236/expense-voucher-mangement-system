-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `expense_voucher_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `expense_voucher_db`;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('Employee', 'Director', 'Accounts') NOT NULL DEFAULT 'Employee',
  `department` VARCHAR(100) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL UNIQUE,
  `signature_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `vouchers`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `voucher_number` VARCHAR(50) NOT NULL UNIQUE,
  `voucher_date` DATE NOT NULL,
  `expense_date` DATE NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `expense_title` VARCHAR(200) NOT NULL,
  `expense_category` VARCHAR(100) NOT NULL,
  `expense_description` TEXT DEFAULT NULL,
  `amount` DECIMAL(12, 2) NOT NULL CHECK (`amount` > 0),
  `user_id` INT NOT NULL,
  `employee_name` VARCHAR(100) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `employee_signature_path` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Draft', 'Submitted', 'Pending Approval', 'Approved', 'Rejected') NOT NULL DEFAULT 'Draft',
  `director_signature_path` VARCHAR(255) DEFAULT NULL,
  `approval_date` DATETIME DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_vouchers_status` (`status`),
  INDEX `idx_vouchers_user_id` (`user_id`),
  INDEX `idx_vouchers_dept` (`department`),
  INDEX `idx_vouchers_category` (`expense_category`),
  INDEX `idx_vouchers_voucher_number` (`voucher_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `voucher_logs` (Audit Trail)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `voucher_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `voucher_id` INT NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `performed_by_id` INT NOT NULL,
  `performed_by_name` VARCHAR(100) NOT NULL,
  `performed_by_role` VARCHAR(50) NOT NULL,
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`performed_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
