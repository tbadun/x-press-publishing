const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const issueRouter = express.Router({ mergeParams: true });
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

issueRouter.use(bodyParser.json());

const checkInput = (req, res, next) => {
    const issue = req.body.issue;
    if (!issue.name || !issue.issueNumber || !issue.publicationDate || !issue.artistId) {
        res.sendStatus(400);
    } else {
        next();
    }
}

issueRouter.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue where id = ${issueId};`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.issue = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

issueRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId};`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ issues: rows });
        }
    })
});

issueRouter.post('/', checkInput, (req, res, next) => {
    const issue = req.body.issue;
    db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) 
            VALUES ("${issue.name}", ${issue.issueNumber}, ${issue.publicationDate}, ${issue.artistId}, ${req.params.seriesId})`, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ issue: row })
                }
            })
        }
    });
});

issueRouter.put('/:issueId', checkInput, (req, res, next) => {
    const issue = req.issue;
    const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = $seriesId WHERE Issue.id = $issueId';
    const values = {
        $name: issue.name,
        $issueNumber: issue.issueNumber,
        $publicationDate: issue.publicationDate,
        $artistId: issue.artistId,
        $seriesId: req.params.seriesId,
        $issueId: req.params.issueId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ issue: row })
                }
            })
        }
    });
});

issueRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM TABLE WHERE id = ${req.params.issueId} AND seriesId = ${req.params.seriesId};`, function(err) {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = issueRouter;