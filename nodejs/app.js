'use strict';

var express = require('express');

var app = express();

app.get('/', function(req,res) {
    res.send('<html><body>TESTE</body></html>');
})


var port = process.env.PORT || 3000;
app.listen(port);
