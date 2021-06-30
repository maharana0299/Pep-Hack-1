const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const port = process.env.PORT || 8080;
const multer = require('multer');
const automate = require('./index');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, 'data' + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
// sendFile will go here
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// It's very crucial that the file name matches the name attribute in your html
app.post('/upload', async(req, res) => {

    upload.single('file')(req, res, async(err) => {
        if (!err) {
            let jsonArray = await automate('./uploads/data.csv');
            if (jsonArray) {
                fs.writeFileSync('./uploads/dataModify.json', JSON.stringify(jsonArray));
                console.log(jsonArray);
            }

            res.sendFile(__dirname + '/tables.html');
            // res.send('Uploading Sucessfull');
        } else {
            res.send('error');
        }
    })

    // res.redirect('/');
});

app.get('/newData', (req, res) => {
    let json = fs.readFileSync('./uploads/dataModify.json');
    res.send(json + "");
});

app.get('/sortIt', (req, res) => {});
app.listen(port);
console.log('Server started at http://localhost:' + port);