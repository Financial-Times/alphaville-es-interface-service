const appRouter = require('express').Router();

appRouter.use('/', (req, res) => {
	res.send('hello');
});
appRouter.use('/__gtg', (req, res) => {
	res.sendStatus(200);
});

appRouter.use('/v1', require('./api/v1'));

module.exports = appRouter;
