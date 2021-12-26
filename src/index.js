const express = require('express');
var bodyParser = require('body-parser');
const mongoose = require('mongoose')
var multer = require('multer') // Here
const route = require('./routes/route.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any()) // HERE

app.use('/', route);
mongoose.connect("mongodb+srv://users-open-to-all:hiPassword123@cluster0.uh35t.mongodb.net/product_Management-Group14?retryWrites=true&w=majority", { useNewUrlParser: true })
    .then(() => console.log('project 5-Group14 DB connected.'))
    .catch(err => console.log(err))


app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});