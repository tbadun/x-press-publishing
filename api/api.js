const express = require('express');
const artistRouter = require('./artists');

apiRouter = express.Router();
apiRouter.use('/artists', artistRouter);

module.exports = apiRouter;