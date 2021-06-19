const express = require('express');
const path = require('path');
const getData = require('./bankData');
const app = express();
const port = process.env.PORT || 8080;

// sendFile will go here
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/hello', function(req, res) {
    res.send('Hello');
})

app.get('/extractData', async(req, res) => {
    console.log('Extracting Data');
    let a = await getData();
    console.log(a);
    res.send(a);
})
app.listen(port);
console.log('Server started at http://localhost:' + port);