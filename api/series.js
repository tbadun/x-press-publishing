const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

seriesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

seriesRouter.use(bodyParser.json());

const checkInput = (req, res, next) => {
    const series = req.body.series;
    if (!series.name || !series.description) {
        res.sendStatus(400);
    } else {
        next();
    }
}

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series where id = ${seriesId};`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.series = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series;`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ series: rows });
        }
    })
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({ series: req.series });
});

seriesRouter.post('/', checkInput, (req, res, next) => {
    const series = req.body.series;
    db.run(`INSERT INTO Series (name, description) 
            VALUES ("${series.name}", "${series.description}")`, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ series: row })
                }
            })
        }
    });
});

seriesRouter.put('/:seriesId', checkInput, (req, res, next) => {
    const series = req.body.series;
    const sql = 'UPDATE Series SET name = $name, description = $description WHERE Series.id = $seriesId';
    const values = {
        $name: series.name,
        $description: series.description,
        $seriesId: req.params.seriesId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ series: row })
                }
            })
        }
    });
});

module.exports = seriesRouter;