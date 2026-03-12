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
        deadline DATETIME,
        is_burned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating features table', err.message);
        } else {
            console.log('Features table ready.');
            // Add pledged_amount column if it doesn't exist
            db.run('ALTER TABLE features ADD COLUMN pledged_amount REAL DEFAULT 0', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    // console.error('Error adding pledged_amount column', err.message);
                }
            });

            // Add is_boosted column if it doesn't exist
            db.run('ALTER TABLE features ADD COLUMN is_boosted INTEGER DEFAULT 0', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    // console.error('Error adding is_boosted column', err.message);
                }
            });

            // Add deadline column if it doesn't exist
            db.run('ALTER TABLE features ADD COLUMN deadline DATETIME', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding deadline column', err.message);
                } else {
                    console.log('deadline column ready.');
                }
            });

            // Add is_burned column if it doesn't exist
            db.run('ALTER TABLE features ADD COLUMN is_burned INTEGER DEFAULT 0', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding is_burned column', err.message);
                } else {
                    console.log('is_burned column ready.');
                }
            });

            // Add ticker column if it doesn't exist
            db.run('ALTER TABLE features ADD COLUMN ticker TEXT', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding ticker column', err.message);
                } else {
                    console.log('ticker column ready.');
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

    // Pledges Table (Transaction History)
    db.run(`CREATE TABLE IF NOT EXISTS pledges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        is_dark_pool INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error('Error creating pledges table', err.message);
        } else {
            console.log('Pledges table ready.');
            // Add is_dark_pool column to pledges if it doesn't exist
            db.run('ALTER TABLE pledges ADD COLUMN is_dark_pool INTEGER DEFAULT 0', (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    // console.error('Error adding is_dark_pool column', err.message);
                } else {
                    console.log('is_dark_pool column ready.');
                }
            });
        }
    });

    // Payouts Table (Admin Withdrawals)
    db.run(`CREATE TABLE IF NOT EXISTS payouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating payouts table', err.message);
        } else {
            console.log('Payouts table ready.');
        }
    });

    // Dividends Table (User Payouts)
    db.run(`CREATE TABLE IF NOT EXISTS dividends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount_per_share REAL NOT NULL,
        total_distributed REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating dividends table', err.message);
        } else {
            console.log('Dividends table ready.');
        }
    });

    // Options Contracts Table
    db.run(`CREATE TABLE IF NOT EXISTS options_contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'call' or 'put'
        strike_price REAL NOT NULL,
        expiration_date DATETIME NOT NULL,
        premium_paid REAL NOT NULL,
        status TEXT DEFAULT 'active', -- 'active', 'exercised', 'expired'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error('Error creating options_contracts table', err.message);
        } else {
            console.log('Options contracts table ready.');
        }
    });

    // Indexes for performance
    db.run('CREATE INDEX IF NOT EXISTS idx_features_status ON features(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_pledges_feature_id ON pledges(feature_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_features_category ON features(category)');
    db.run('CREATE INDEX IF NOT EXISTS idx_features_is_boosted ON features(is_boosted)');
});

module.exports = db;
