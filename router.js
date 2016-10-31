const appRouter = require('express').Router();

appRouter.get('/', (req, res) => {
	res.send('hello');
});
appRouter.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});

appRouter.use('/v1', require('./api/v1'));

module.exports = appRouter;
