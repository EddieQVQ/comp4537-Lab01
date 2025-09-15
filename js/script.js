// Used ChatGPT for assistance with code

const STORAGE_KEY = 'notes';
let notes = [];
let saveInterval;
let retrieveInterval;
let timestampInterval;

function Note(content = '', id = null) {
    this.id = id || Date.now() + Math.random(); 
    this.content = content;
    this.textarea = null;
    this.removeButton = null;
    this.container = null;
    
    this.create = function() {
        this.container = document.createElement('div');
        this.container.className = 'note-item';
        this.container.setAttribute('data-note-id', this.id);
        
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'note-textarea';
        this.textarea.value = this.content;
        this.textarea.placeholder = 'Enter your note here...';
        
        this.removeButton = document.createElement('button');
        this.removeButton.className = 'remove-button';
        this.removeButton.textContent = MESSAGES.REMOVE_NOTE;
        
        const self = this;
        this.textarea.addEventListener('input', function() {
            self.content = this.value;
        });
        
        this.removeButton.addEventListener('click', function() {
            self.remove();
        });
        
        this.container.appendChild(this.textarea);
        this.container.appendChild(this.removeButton);
        
        return this.container;
    };
    
    this.remove = function() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        if (typeof removeNote === 'function') {
            removeNote(this.id);
        }
    };
    
    this.getData = function() {
        return {
            id: this.id,
            content: this.content
        };
    };
}

function getPage() {
    const path = window.location.pathname;
    if (path.includes('writer.html')) return 'writer';
    if (path.includes('reader.html')) return 'reader';
    return 'index';
}

function saveNotes() {
    try {
        const notesData = notes.map(function(note) {
            return note.getData();
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notesData));
    } catch (error) {
        console.error('Error saving notes to localStorage:', error);
    }
}

function removeNote(noteId) {
    notes = notes.filter(function(note) {
        return note.id !== noteId;
    });
    
    saveNotes();
}

function initIndex() {
    const appTitle = document.getElementById('app-title');
    const studentName = document.getElementById('student-name');
    const writerLink = document.getElementById('writer-link');
    const readerLink = document.getElementById('reader-link');
    
    if (appTitle) appTitle.textContent = MESSAGES.APP_TITLE;
    if (studentName) studentName.textContent = MESSAGES.STUDENT_NAME;
    if (writerLink) writerLink.textContent = MESSAGES.WRITER_LABEL;
    if (readerLink) readerLink.textContent = MESSAGES.READER_LABEL;
}

function initWriter() {
    const pageTitle = document.getElementById('page-title');
    const addButton = document.getElementById('add-button');
    const backLink = document.getElementById('back-link');
    
    if (pageTitle) pageTitle.textContent = MESSAGES.WRITER_PAGE_TITLE;
    if (addButton) addButton.textContent = MESSAGES.ADD_NOTE;
    if (backLink) backLink.textContent = MESSAGES.BACK_TO_HOME;
    
    loadNotes();
    
    if (addButton) {
        addButton.addEventListener('click', addNote);
    }
    
    saveInterval = setInterval(saveNotes, 2000);
    
    timestampInterval = setInterval(updateWriterTime, 1000);
    
    updateWriterTime();
}

function addNote() {
    const note = new Note();
    notes.push(note);
    
    const notesContainer = document.getElementById('notes-container');
    const addButton = document.getElementById('add-button');
    
    if (notesContainer && addButton) {
        const noteElement = note.create();
        notesContainer.insertBefore(noteElement, addButton);
        
        if (note.textarea) {
            note.textarea.focus();
        }
    }
}

function loadNotes() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const notesData = JSON.parse(storedData);
            const notesContainer = document.getElementById('notes-container');
            
            if (notesData && Array.isArray(notesData) && notesContainer) {
                notesData.forEach(function(noteData) {
                    const note = new Note(noteData.content, noteData.id);
                    notes.push(note);
                    
                    const noteElement = note.create();
                    notesContainer.appendChild(noteElement);
                });
            }
        }
    } catch (error) {
        console.error('Error loading notes from localStorage:', error);
    }
}

function updateWriterTime() {
    const timestampElement = document.getElementById('timestamp');
    if (timestampElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timestampElement.textContent = MESSAGES.STORED_AT + ' ' + timeString;
    }
}

function initReader() {
    const pageTitle = document.getElementById('page-title');
    const backLink = document.getElementById('back-link');
    
    if (pageTitle) pageTitle.textContent = MESSAGES.READER_PAGE_TITLE;
    if (backLink) backLink.textContent = MESSAGES.BACK_TO_HOME;
    
    displayNotes();
    
    retrieveInterval = setInterval(displayNotes, 2000);
    
    timestampInterval = setInterval(updateReaderTime, 1000);
    
    updateReaderTime();
}

function displayNotes() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        const notesDisplay = document.getElementById('notes-display');
        
        if (!notesDisplay) return;
        
        notesDisplay.innerHTML = '';
        
        if (storedData) {
            const notesData = JSON.parse(storedData);
            
            if (notesData && Array.isArray(notesData)) {
                notesData.forEach(function(noteData) {
                    const noteDiv = document.createElement('div');
                    noteDiv.className = 'note-display-item';
                    noteDiv.textContent = noteData.content || '';
                    notesDisplay.appendChild(noteDiv);
                });
            }
        }
    } catch (error) {
        console.error('Error loading notes from localStorage:', error);
    }
}

function updateReaderTime() {
    const timestampElement = document.getElementById('timestamp');
    if (timestampElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timestampElement.textContent = MESSAGES.UPDATED_AT + ' ' + timeString;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = getPage();
    
    switch (currentPage) {
        case 'index':
            initIndex();
            break;
        case 'writer':
            initWriter();
            break;
        case 'reader':
            initReader();
            break;
    }
});

window.addEventListener('beforeunload', function() {
    if (saveInterval) {
        clearInterval(saveInterval);
    }
    if (retrieveInterval) {
        clearInterval(retrieveInterval);
    }
    if (timestampInterval) {
        clearInterval(timestampInterval);
    }
    
    if (getPage() === 'writer') {
        saveNotes();
    }
});