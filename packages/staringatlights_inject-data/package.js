/* global Package */
Package.describe({
	summary: 'A way to inject data to the client with initial HTML',
	version: '2.2.0',
	git: 'https://github.com/abecks/meteor-inject-data',
	name: 'staringatlights:inject-data',
})

Package.onUse(function(api) {
	api.versionsFrom('METEOR@1.6.1')
	api.use('webapp', 'server')
	api.use(['ejson', 'underscore', 'ecmascript'], ['server', 'client'])
	api.mainModule('lib/namespace.js', ['server', 'client'])
	api.addFiles('lib/utils.js', ['server', 'client'])
	api.addFiles('lib/server.js', 'server')
	api.addFiles('lib/client.js', 'client')
	api.export('InjectData', ['client', 'server'])
})

