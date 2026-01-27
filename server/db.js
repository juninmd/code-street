const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    db.serialize(() => {
        // Features Table
        db.run(`CREATE TABLE IF NOT EXISTS features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            votes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'under_review',
            category TEXT DEFAULT 'feature',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating features table', err.message);
            } else {
                console.log('Features table ready.');
            }
        });

        // Comments Table
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feature_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('Error creating comments table', err.message);
            } else {
                console.log('Comments table ready.');
            }
        });
    });
  }
});

module.exports = db;
