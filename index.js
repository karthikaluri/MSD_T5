

const express = require('express');
const app = express();
app.use(express.json());


let books = [
  { id: 1, title: "Linear Algebra", author: "Karthik", available: true },
  { id: 2, title: "Calculus", author: "Anand", available: false },
  { id: 3, title: "Datastructures", author: "Roshan", available: true }
];

let users = [
  { id: 101, name: "Karthik", email: "karthik@gmail.com" },
  { id: 102, name: "Anand", email: "anand@gmail.com" }
];

let borrowRecords = [
  { userId: 101, bookId: 3, borrowedDate: "2025-10-10", returned: false },
  { userId: 101, bookId: 2, borrowedDate: "2025-09-25", returned: true }
];


app.get('/api/books', (req, res) => res.json(books));

app.get('/api/users', (req, res) => res.json(users));

app.post('/api/users', (req, res) => {
  const newUser = { id: users.length + 101, name: req.body.name, email: req.body.email };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  res.json(user);
});

app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id != req.params.id);
  res.json({ message: "User deleted" });
});

app.post('/api/borrow', (req, res) => {
  const { userId, bookId } = req.body;
  const book = books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (!book.available) return res.status(400).json({ message: "Book already borrowed" });
  book.available = false;
  const record = { userId, bookId, borrowedDate: new Date().toISOString().split('T')[0], returned: false };
  borrowRecords.push(record);
  res.status(201).json(record);
});

app.post('/api/return', (req, res) => {
  const { userId, bookId } = req.body;
  const record = borrowRecords.find(r => r.userId === userId && r.bookId === bookId && !r.returned);

  record.returned = true;
  const book = books.find(b => b.id === bookId);
  if (book) book.available = true;
  res.json({ message: "Book returned successfully" });
});

app.get('/api/books/:bookId', (req, res) => {
  const book = books.find(b => b.id == req.params.bookId);

  res.json(book);
});

app.get('/api/users/:userId/borrow-history', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
 
  const userHistory = borrowRecords
    .filter(r => r.userId == req.params.userId)
    .map(r => {
      const book = books.find(b => b.id === r.bookId);
      return {
        bookId: r.bookId,
        title: book ? book.title : "Unknown",
        borrowedDate: r.borrowedDate,
        returned: r.returned
      };
    });
  res.json({ userId: user.id, name: user.name, borrowedBooks: userHistory });
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
