const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure DB connection via environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
async function initDb() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
}

initDb().catch(err => {
  console.error('Failed to initialize DB pool:', err);
  process.exit(1);
});

// --- Books CRUD ---
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, isbn, copies } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'Missing fields' });
  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, isbn, copies) VALUES (?, ?, ?, ?)',
      [title, author, isbn || null, copies || 1]
    );
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  const id = req.params.id;
  const { title, author, isbn, copies } = req.body;
  try {
    await pool.query('UPDATE books SET title = ?, author = ?, isbn = ?, copies = ? WHERE id = ?', [title, author, isbn, copies, id]);
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM books WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Members CRUD ---
app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM members');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const [result] = await pool.query('INSERT INTO members (name, email, phone) VALUES (?, ?, ?)', [name, email || null, phone || null]);
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/members/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email, phone } = req.body;
  try {
    await pool.query('UPDATE members SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, id]);
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM members WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Loans ---
app.get('/api/loans', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT loans.id, loans.book_id, books.title AS book_title, loans.member_id, members.name AS member_name, loans.loan_date, loans.return_date
       FROM loans
       JOIN books ON loans.book_id = books.id
       JOIN members ON loans.member_id = members.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a loan (lend a book)
app.post('/api/loans', async (req, res) => {
  const { book_id, member_id } = req.body;
  if (!book_id || !member_id) return res.status(400).json({ error: 'Missing book_id or member_id' });
  try {
    // Check available copies
    const [books] = await pool.query('SELECT copies FROM books WHERE id = ?', [book_id]);
    if (!books.length) return res.status(404).json({ error: 'Book not found' });
    if (books[0].copies <= 0) return res.status(400).json({ error: 'No copies available' });

    await pool.query('INSERT INTO loans (book_id, member_id, loan_date) VALUES (?, ?, CURDATE())', [book_id, member_id]);
    await pool.query('UPDATE books SET copies = copies - 1 WHERE id = ?', [book_id]);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return a book (set return_date)
app.put('/api/loans/:id/return', async (req, res) => {
  const id = req.params.id;
  try {
    // Find loan
    const [loans] = await pool.query('SELECT * FROM loans WHERE id = ? AND return_date IS NULL', [id]);
    if (!loans.length) return res.status(404).json({ error: 'Active loan not found' });
    const loan = loans[0];
    await pool.query('UPDATE loans SET return_date = CURDATE() WHERE id = ?', [id]);
    await pool.query('UPDATE books SET copies = copies + 1 WHERE id = ?', [loan.book_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
