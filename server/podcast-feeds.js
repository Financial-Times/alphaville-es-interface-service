require('isomorphic-fetch');

const CLUSTER = require('./lib/get-es-cluster');

const args = require('minimist')(process.argv.slice(2));
const PodcastUpdater = require('./processes/podcast-updater');
const { series } = require('promise-patterns');
const logger = require('./lib/logger');
const interval = args.interval || 1 * 60 * 60 * 1000; // h * m * s * ms
const berthaUrl = 'https://bertha.ig.ft.com/view/publish/gss';


const feeds = [
	{
		rss: 'http://rss.acast.com/ft-alphachat',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Alphachat'
	},
	{
		rss: 'http://rss.acast.com/ft-arts',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Arts'
	},
	{
		rss: 'http://rss.acast.com/ft-banking-weekly',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Banking%20Weekly'
	},
	{
		rss: 'http://rss.acast.com/ft-big-read',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Big%20Read'
	},
	{
		rss: 'http://rss.acast.com/ft-connected-business',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Connected%20Business'
	},
	{
		rss: 'http://rss.acast.com/ft-hard-currency',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Hard%20Currency'
	},
	{
		rss: 'http://rss.acast.com/ft-investigations',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Investigations'
	},
	{
		rss: 'http://rss.acast.com/ft-lucy-kellaway',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Lucy%20Kellaway'
	},
	{
		rss: 'http://rss.acast.com/ft-money-show',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Money%20Show'
	},
	{
		rss: 'http://rss.acast.com/ft-news',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/News'
	},
	{
		rss: 'http://rss.acast.com/ft-uk-general-election-2015',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/UK%20General%20Election%202015'
	},
	{
		rss: 'http://rss.acast.com/ft-world-weekly',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/World%20Weekly'
	},
	{
		rss: 'http://rss.acast.com/ft-moneypenny'
	},
	{
		rss: 'http://rss.acast.com/ft-startup-stories'
	},
	{
		rss: 'http://rss.acast.com/ft-tech-tonic'
	},
	{
		rss: 'http://rss.acast.com/ft-management',
		legacyMapping: '/1IzfwkJSrE8fjIO2qS1SUfEGkwzJp40hgaAgs4XtFH28/Management'
	},
	{
		rss: 'http://rss.acast.com/ft-world-tech-founders'
	},
	{
		rss: 'https://rss.acast.com/ft-everything-else'
	}
];

function update () {
	const start = Date.now();

	const tasks = feeds
		.filter((feed) => (
			!args.show || feed.rss.endsWith(args.show)
		))
		.map((feed) => {
			const updater = new PodcastUpdater({
				elasticSearchUrl: CLUSTER,
				legacyMappingUrl: feed.legacyMapping ? berthaUrl + feed.legacyMapping : null,
				rssFeedUrl: feed.rss,
				all: args.all,
				quiet: args.quiet
			});

			return () => updater.init();
		});

	logger.info(`event=PODCAST_INGEST_WILL_RUN size=${feeds.length}`);

	return series(tasks)
		.then(() => {
			const time = ((Date.now() - start) / 1000).toFixed(2);
			logger.info(`event=PODCAST_INGEST_COMPLETE time=${time}s`);
		})
		.catch((err) => {
			logger.error(`event=PODCAST_INGEST_ERROR message=${err.message}`);
		});
}

function schedule () {
	setTimeout(() => {
		update().then(schedule);
	}, interval);
}

if (args.once) {
	update().then(() => process.exit());
} else {
	schedule();
}
