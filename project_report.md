# Library System — Project Report

**Introduction:**
This project implements a small Library Management System to manage books, members, and loans. Purpose: practice database design (MySQL) and build a web interface using HTML/CSS/JavaScript with a Node/Express backend.

**Database Design (ER Diagram - ASCII):**

books (1) ---- (N) loans (N) ---- (1) members

Tables:
- books: id (PK), title, author, isbn, copies
- members: id (PK), name, email, phone
- loans: id (PK), book_id (FK -> books.id), member_id (FK -> members.id), loan_date, return_date

Constraints: primary keys and foreign keys are defined; loans refer to books and members. When a loan is created, the `books.copies` is decremented; when returned, incremented.

**Web Interface:**
- `index.html` has three sections: Books, Members, Loans.
- Forms allow adding/updating records. JavaScript (`app.js`) uses `fetch` to call REST endpoints.
- Basic client-side validation is included (required fields).

**Challenges and Learning:**
- Managing referential integrity (loans tied to books and members) and synchronizing copies counts.
- Building a minimal but functional UI without frameworks helped clarify how frontend and backend interact.

**Submission:**
Push the `library-system` folder to your GitHub repo and include screenshots of the running app. The `db.sql` file can recreate the database and sample data.
