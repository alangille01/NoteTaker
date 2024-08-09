const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes

// GET /api/notes - Returns all notes as JSON
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes.' });
    }
    res.json(JSON.parse(data));
  });
});

// API Route to delete a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes.' });
    }

    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== noteId);

    fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete note.' });
      }

      res.json({ message: 'Note deleted successfully' });
    });
  });
});


// POST /api/notes - Receives a new note, saves it, and returns it to the client
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4(); // Add a unique ID to the note

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes.' });
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save note.' });
      }

      res.json(newNote);
    });
  });
});
// HTML Routes

// GET /notes - Returns the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// GET * - Catch-all route that returns the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
