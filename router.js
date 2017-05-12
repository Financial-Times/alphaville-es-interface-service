const appRouter = require('express').Router();

appRouter.get('/', (req, res) => {
	res.send('hello');
});
appRouter.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});

appRouter.use('/v2', require('./api/v2'));

module.exports = appRouter;
