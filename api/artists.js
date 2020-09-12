const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const artistRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

artistRouter.use(bodyParser.json());

artistRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1;', (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ artists: rows });
        }
    })
});

const checkInput = (req, res, next) => {
    const artist = req.body.artist;
    if (!artist.name || !artist.dateOfBirth || !artist.biography) {
        res.sendStatus(400);
    } else {
        next();
    }
}

artistRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist where id = ${artistId};`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.artist = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

artistRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({ artist: req.artist });
});

artistRouter.post('/', checkInput, (req, res, next) => {
    const artist = req.body.artist;
    const emp = artist.isCurrentlyEmployed === 0 ? 0 : 1;
    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) 
            VALUES ("${artist.name}", "${artist.dateOfBirth}", "${artist.biography}", ${emp})`, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ artist: row })
                }
            })
        }
    });
});

artistRouter.put('/:artistId', checkInput, (req, res, next) => {
    const artist = req.body.artist;
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';
    const values = {
        $name: artist.name,
        $dateOfBirth: artist.dateOfBirth,
        $biography: artist.biography,
        $isCurrentlyEmployed: artist.isCurrentlyEmployed,
        $artistId: req.params.artistId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ artist: row })
                }
            })
        }
    });
});

artistRouter.delete('/:artistId', (req, res, next) => {
    const artistId = req.params.artistId;
    const sql = `UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = ${artistId};`;
    db.run(sql, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ artist: row })
                }
            })
        }
    });
});

module.exports = artistRouter;