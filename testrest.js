var restify = require("restify")
var server = restify.createServer()
server['get']('/', function(req, res) {
    console.log("Hello world!");
    res.end("hello")
})
server.listen(3000)