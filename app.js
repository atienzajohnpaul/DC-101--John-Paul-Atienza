// Frontend logic: fetch API and update DOM
const api = {
  books: '/api/books',
  members: '/api/members',
  loans: '/api/loans'
};

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Books
async function loadBooks() {
  const books = await fetchJSON(api.books);
  const list = document.getElementById('book-list');
  list.innerHTML = '';
  const bookSelect = document.getElementById('loan-book');
  bookSelect.innerHTML = '';
  for (const b of books) {
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${escapeHtml(b.title)}</strong> <span class="muted">by ${escapeHtml(b.author)} (copies: ${b.copies})</span></div>`;
    const actions = document.createElement('div');
    actions.innerHTML = `<button onclick="editBook(${b.id})">Edit</button> <button onclick="deleteBook(${b.id})">Delete</button>`;
    li.appendChild(actions);
    list.appendChild(li);

    const opt = document.createElement('option');
    opt.value = b.id;
    opt.text = `${b.title} (${b.copies})`;
    bookSelect.appendChild(opt);
  }
}

async function addOrUpdateBook(e) {
  e.preventDefault();
  const id = document.getElementById('book-id').value;
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const isbn = document.getElementById('isbn').value.trim();
  const copies = parseInt(document.getElementById('copies').value, 10) || 1;
  if (!title || !author) return alert('Title and author required');
  try {
    if (id) {
      await fetchJSON(api.books + '/' + id, {
        method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title, author, isbn, copies })
      });
    } else {
      await fetchJSON(api.books, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title, author, isbn, copies })
      });
    }
    document.getElementById('book-form').reset();
    loadBooks();
  } catch (err) { alert('Error: ' + err.message); }
}

function editBook(id) {
  fetch(api.books).then(r=>r.json()).then(books=>{
    const b = books.find(x=>x.id===id);
    if (!b) return;
    document.getElementById('book-id').value = b.id;
    document.getElementById('title').value = b.title;
    document.getElementById('author').value = b.author;
    document.getElementById('isbn').value = b.isbn || '';
    document.getElementById('copies').value = b.copies;
  });
}

async function deleteBook(id){
  if (!confirm('Delete book?')) return;
  await fetchJSON(api.books + '/' + id, { method: 'DELETE' });
  loadBooks();
}

// Members
async function loadMembers(){
  const members = await fetchJSON(api.members);
  const list = document.getElementById('member-list');
  list.innerHTML = '';
  const memberSelect = document.getElementById('loan-member');
  memberSelect.innerHTML = '';
  for (const m of members){
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${escapeHtml(m.name)}</strong> <span class="muted">${escapeHtml(m.email||'')}</span></div>`;
    const actions = document.createElement('div');
    actions.innerHTML = `<button onclick="editMember(${m.id})">Edit</button> <button onclick="deleteMember(${m.id})">Delete</button>`;
    li.appendChild(actions);
    list.appendChild(li);

    const opt = document.createElement('option'); opt.value = m.id; opt.text = m.name; memberSelect.appendChild(opt);
  }
}

async function addOrUpdateMember(e){
  e.preventDefault();
  const id = document.getElementById('member-id').value;
  const name = document.getElementById('m-name').value.trim();
  const email = document.getElementById('m-email').value.trim();
  const phone = document.getElementById('m-phone').value.trim();
  if (!name) return alert('Name required');
  try{
    if (id) await fetchJSON(api.members + '/' + id, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,email,phone}) });
    else await fetchJSON(api.members, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,email,phone}) });
    document.getElementById('member-form').reset();
    loadMembers();
  }catch(err){alert('Error: '+err.message)}
}

function editMember(id){
  fetch(api.members).then(r=>r.json()).then(members=>{
    const m = members.find(x=>x.id===id); if(!m) return;
    document.getElementById('member-id').value = m.id;
    document.getElementById('m-name').value = m.name;
    document.getElementById('m-email').value = m.email || '';
    document.getElementById('m-phone').value = m.phone || '';
  });
}

async function deleteMember(id){
  if (!confirm('Delete member?')) return;
  await fetchJSON(api.members + '/' + id, { method:'DELETE' });
  loadMembers();
}

// Loans
async function loadLoans(){
  const loans = await fetchJSON(api.loans);
  const list = document.getElementById('loan-list');
  list.innerHTML = '';
  for (const l of loans){
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${escapeHtml(l.book_title)}</strong> <span class="muted">lent to ${escapeHtml(l.member_name)} on ${l.loan_date}${l.return_date?(' — returned '+l.return_date):''}</span></div>`;
    const actions = document.createElement('div');
    if (!l.return_date) actions.innerHTML = `<button onclick="returnLoan(${l.id})">Return</button>`;
    li.appendChild(actions);
    list.appendChild(li);
  }
}

async function lendBook(e){
  e.preventDefault();
  const book_id = document.getElementById('loan-book').value;
  const member_id = document.getElementById('loan-member').value;
  try{
    await fetchJSON(api.loans, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({book_id, member_id}) });
    loadBooks(); loadLoans();
  }catch(err){alert('Error: '+err.message)}
}

async function returnLoan(id){
  if(!confirm('Mark as returned?')) return;
  await fetchJSON(api.loans + '/' + id + '/return', { method:'PUT' });
  loadBooks(); loadLoans();
}

// Utilities
function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>\"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c]); }

// Wire forms
document.getElementById('book-form').addEventListener('submit', addOrUpdateBook);
document.getElementById('member-form').addEventListener('submit', addOrUpdateMember);
document.getElementById('loan-form').addEventListener('submit', lendBook);

// Initial load
loadBooks(); loadMembers(); loadLoans();
