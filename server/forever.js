var forever = require('forever-monitor');

var child = new (forever.Monitor)('server.js', {
	'max': 10,
	'silent': false,
	'logFile': './forever.log',
	'outFile': './forever.out',
	'errFile': './forever.err',
	'options': ['-a']
});

child.on('exit', function () {
	console.log('server.js has exited after 5 restarts');
});

child.start();