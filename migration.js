const sqlite = require('sqlite3');

const db = new sqlite.Database('./database.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS Artist (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    biography TEXT NOT NULL,
    is_currently_employed INTEGER DEFAULT 1,
    PRIMARY KEY("id" AUTOINCREMENT));`)

db.run(`CREATE TABLE IF NOT EXISTS Series (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT));`)

db.run(`CREATE TABLE IF NOT EXISTS Issue (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    issue_number INTEGER NOT NULL,
    publication_date TEXT NOT NULL,
    artist_id INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    FOREIGN KEY("artist_id") REFERENCES "Artist"("id"),
    FOREIGN KEY("series_id") REFERENCES "Series"("id"),
    PRIMARY KEY("id" AUTOINCREMENT));`)