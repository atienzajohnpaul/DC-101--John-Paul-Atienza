# Library System

Simple Library System demonstrating MySQL backend with a Node.js (Express) server and a plain HTML/CSS/JavaScript frontend.

Setup (PowerShell):

1. Create and import the database:

```powershell
# Start MySQL server and then import schema (adjust path to db.sql)
mysql -u root -p < db.sql
```

2. Install dependencies and run server:

```powershell
cd library-system
npm install
# Optionally set DB env vars; defaults assume local MySQL and database `library_db`
$env:DB_HOST = 'localhost'; $env:DB_USER = 'root'; $env:DB_PASSWORD = ''; $env:DB_NAME = 'library_db'
npm start
```

3. Open http://localhost:3000 in your browser.

Files:
- `db.sql` - schema and sample data
- `server.js` - Express API server
- `public/` - `index.html`, `styles.css`, `app.js`
- `project_report.md` - brief report and ER diagram
