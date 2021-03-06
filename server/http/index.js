var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var winston = require('winston');
var path = require('path');
var Q = require('q');

var APP_ROOT = path.resolve(__dirname, "../../");

app.get('/', function(req, res) {
	res.sendFile(APP_ROOT + '/client/index.html');
});

app.get('/css/:name', function(req, res) {
	res.sendFile(APP_ROOT + '/client/css/' + req.params.name);
});

app.get('/js/:name', function(req, res) {
	res.sendFile(APP_ROOT + '/client/js/' + req.params.name);
});

app.get('/tones/*', function(req, res) {
	res.sendFile(APP_ROOT + '/client/dev_tones free/' + req.params[0]);
});


io.on('connection', function(socket) {
	winston.info('a user connected');
	socket.on('disconnect', function() {
		winston.info('user disconnected');
	});

	socket.on('mousemove', function(data) {
		socket.broadcast.emit('moving', data);
	});


	socket.on('chat', function(data) {
		winston.info('[chat] ' + data.name + ": " + data.message);
		if (data.message.charAt(0) == "/" && data.message.charAt(1) == "]") {
			socket.broadcast.emit('sudo', data.message.substr(2));
		} else {
			io.emit('chat', data);
		}
	});
});

// TODO: Move socket server into a sepera te server folder, and run on separate port
module.exports = {
	start: function(port = 8080) {
		http.listen(port, function() {
			winston.info("http server listening on *:" + port);
		});
	}
}
