const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Features Table
    db.run(`CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        votes INTEGER DEFAULT 0,
        status TEXT DEFAULT 'under_review',
        category TEXT DEFAULT 'feature',
        pledged_amount REAL DEFAULT 0,
            is_boosted INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating features table', err.message);
        } else {
            console.log('Features table ready.');
            // Add pledged_amount column if it doesn't exist
            db.run('ALTER TABLE features ADD COLUMN pledged_amount REAL DEFAULT 0', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding pledged_amount column', err.message);
                } else {
                    console.log('pledged_amount column ready.');
                }
            });

            // Add is_boosted column if it doesn't exist
            db.run('ALTER TABLE features ADD COLUMN is_boosted INTEGER DEFAULT 0', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding is_boosted column', err.message);
                } else {
                    console.log('is_boosted column ready.');
                }
            });
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

    // Indexes for performance
    db.run('CREATE INDEX IF NOT EXISTS idx_features_status ON features(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_features_category ON features(category)');
    db.run('CREATE INDEX IF NOT EXISTS idx_features_is_boosted ON features(is_boosted)');
});

module.exports = db;
