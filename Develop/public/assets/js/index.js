const noteTitle = document.querySelector('.note-title');
const noteText = document.querySelector('.note-textarea');
const saveNoteBtn = document.querySelector('.save-note');
const newNoteBtn = document.querySelector('.new-note');
const noteList = document.querySelector('#list-group');
const clearFormBtn = document.querySelector('.clear-btn');
let activeNote = {};

// Function to show or hide the save button
const toggleSaveButton = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    saveNoteBtn.style.display = 'none';
  } else {
    saveNoteBtn.style.display = 'block';
  }
};

// Function to render the active note in the main area
const renderActiveNote = () => {
  if (activeNote.id) {
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
    saveNoteBtn.style.display = 'none'; // Hide save button when viewing an existing note
  } else {
    noteTitle.value = '';
    noteText.value = '';
    saveNoteBtn.style.display = 'block'; // Show save button when creating a new note
  }
};

// Function to fetch and render the list of notes
const getAndRenderNotes = () => {
  fetch('/api/notes')
    .then(response => response.json())
    .then(data => renderNoteList(data));
};

// Function to save a new note
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

// Function to delete a note
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Handle note title and text input events to show the save button
noteTitle.addEventListener('input', toggleSaveButton);
noteText.addEventListener('input', toggleSaveButton);

// Handle new note button click
const handleNewNoteView = () => {
  activeNote = {};
  renderActiveNote();
};

// Save the note and then re-render the notes list
const handleNoteSave = () => {
  const title = noteTitle.value.trim();
  const text = noteText.value.trim();

  if (title) { // Ensure that the title is not empty
    const newNote = {
      title,
      text,
    };
    saveNoteBtn.style.display = 'none'; // Hide save button after saving
    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  } else {
    alert('Note title cannot be empty.');
  }
};

// Handle delete note icon click
const handleNoteDelete = (e) => {
  e.stopPropagation(); // Prevent the click from triggering other events
  const noteId = e.target.getAttribute('id');

  // Delete the note and re-render the note list
  deleteNote(noteId).then(() => {
    // Clear the active note if it was the one that was deleted
    if (activeNote.id === noteId) {
      activeNote = {};
      renderActiveNote();
    }
    // Re-fetch and re-render the note list
    getAndRenderNotes();
  });
};

// Function to render the list of notes
const renderNoteList = (notes) => {
  noteList.innerHTML = '';
  notes.forEach((note) => {
    const noteItem = document.createElement('li');
    noteItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    
    // Note title
    const noteTitle = document.createElement('span');
    noteTitle.innerText = note.title;
    noteTitle.setAttribute('id', JSON.stringify(note));
    noteTitle.addEventListener('click', handleNoteClick);

    // Delete icon
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-trash-alt', 'text-danger', 'ml-2');
    deleteIcon.setAttribute('id', note.id);
    deleteIcon.addEventListener('click', handleNoteDelete);

    noteItem.append(noteTitle, deleteIcon);
    noteList.append(noteItem);
  });
};

// Handle note click to view the selected note
const handleNoteClick = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.getAttribute('id'));
  renderActiveNote();
};

// Handle new note button click
newNoteBtn.addEventListener('click', handleNewNoteView);

// Save note button click event
saveNoteBtn.addEventListener('click', handleNoteSave);

// Clear form button click event
const handleClearForm = () => {
  noteTitle.value = '';
  noteText.value = '';
  activeNote = {}; // Clear the active note
  renderActiveNote(); // Update the form display
  saveNoteBtn.style.display = 'none'; // Hide the save button
};

clearFormBtn.addEventListener('click', handleClearForm);

// Initial rendering of notes
getAndRenderNotes();
