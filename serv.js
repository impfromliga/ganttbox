"use strict";
var HTTPPORT = 80;
var SSLPORT = 443;
var auth = {login: 'root', password: 'root'} //пароль оператора (после тестов поменять!)
//var EXPIRED_TIME = 3600000; //session time

//front admin.js cache:
var fs = require('fs');
var adminJs = fs.readFileSync(__dirname+'/static/admin.js','utf8');

//Router:
var express = require('express');
var app = express();
app.use(/\/admin\w*.js/, hndSeqAdminJs)
app.use('/',express.static(__dirname + '/static'));

//HTTP to HTTPS redirect
var http = express();
http.get('*', function(req, res){res.redirect('https://' + req.headers.host + req.url)});
http.listen(PORT);

//HTTPS:
const options = {key: fs.readFileSync('./key.pem', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8')};
var https = require('https').createServer(options, app);
https.listen(SSLPORT);
console.log('run gasbot server on port', SSLPORT);

//Basic HTTP auth (express.use handler):
function hndSeqAdminJs(req, res, next) {
	var adminRoute = parseUrl(req.originalUrl).file;
	var b64auth = (req.headers.authorization || '').split(' ')[1] || ''
	var logPas = new Buffer(b64auth, 'base64').toString().split(':')
	if (!logPas[0] || !logPas[1] || logPas[0] !== auth.login || logPas[1] !== auth.password) {
		res.set('WWW-Authenticate', 'Basic realm="nope"');
		res.status(401).send('You shall not pass.');
		console.log('admin auth failed');
		return
	}
	//защита от мультилогин
//	if(expired > (new Date).getTime()){
//		res.writeHead(200);
//		res.end('Some one else alrady logined! Multiple login is not allowed!');
//		return;
//	}
//	disconnect();
//	expired = (new Date).getTime() + EXPIRED_TIME;

	token = Math.random()*9e9|0;
	console.log('admin auth success, token:',token);
	res.writeHead(200);
	res.write('const TOKEN='+token+';');
	res.end(adminJs);
	//next();
}

//Overall tiny url parser:
function parseUrl(a){return a=/^(?:(?:([^:/?#]+):\/\/)(([^:/]+?)(?::([^/]+))?@)?(([A-Za-z0-9]+(?:[A-Za-z0-9-.](?=[A-Za-z0-9])|[A-Za-z0-9])*)(?::([0-9]+))?)?)?(((?:\/|^)([^? ]*\/)?(([^/?# ]+?)(?:\.([^.?# ]*))?)?)(\?([^#]*))?)(?:#(.*))?$/.exec(a),null===a?null:{href:a[0],protocol:a[1],auth:a[2],login:a[3],password:a[4],host:a[5],hostname:a[6],port:a[7],path:a[8],pathname:a[9],dir:a[10],file:a[11],filename:a[12],ext:a[13],search:a[14],query:a[15],hash:a[16]}}

//WebSocket:
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({server:https});
wss.on('connection', function(ws){
	ws.on('error', function(){console.log('WS connection error')});
	ws.on('close', function(){console.log('WS connection closed!')});
	ws.on('message', function(pkg){
		
	});
});