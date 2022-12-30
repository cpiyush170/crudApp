const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');
// setting view engine as ejs 
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(methodOverride('_method'));
// importing mongoose (ODM)
const mongoose = require('mongoose');

let uri = "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.pnum9.mongodb.net/?retryWrites=true&w=majority";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(uri, options).then(() => {
    console.log('database connection established');
}, err => {
    {
        console.log("error connecting db due to: ", err);

    }
});


app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);
app.listen(process.env.PORT || 3000)