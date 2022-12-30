const mongoose = require('mongoose');
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// this code make sure that authors with books doesn't get deleted
authorSchema.pre('remove', function (next) {
    Book.find({ author: this.id }, (err, books) => {
        if (err) {
            next(err)
        }
        else if (books.length > 0) {
            next(new Error('This author has books, you are not allowed to delete'))
        }
        else {
            next()
        }
    })
})


module.exports = mongoose.model('Author', authorSchema);
