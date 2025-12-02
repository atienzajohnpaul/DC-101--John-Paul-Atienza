-- Library System schema and sample data
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(50),
  copies INT NOT NULL DEFAULT 1
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50)
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  member_id INT NOT NULL,
  loan_date DATE NOT NULL,
  return_date DATE DEFAULT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO books (title, author, isbn, copies) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 3),
('1984', 'George Orwell', '9780451524935', 2),
('Clean Code', 'Robert C. Martin', '9780132350884', 1);

INSERT INTO members (name, email, phone) VALUES
('Alice Johnson', 'alice@example.com', '555-0101'),
('Bob Smith', 'bob@example.com', '555-0202');

-- Example queries for CRUD
-- Read all books: SELECT * FROM books;
-- Create book: INSERT INTO books (title, author, isbn, copies) VALUES (...);
-- Update book: UPDATE books SET title = 'New' WHERE id = 1;
-- Delete book: DELETE FROM books WHERE id = 1;
