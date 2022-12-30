const express = require('express');
const router = express.Router();
//const multer = require('multer'); we are using filePond
// const path = require('path');
// const fs = require('fs')
const Book = require('../models/book');
const Author = require('../models/author');
//const uploadPath = path.join('public', Book.coverImageBasePath)


// code used by multer library
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];

// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype));
//     }
// })

// All Books route
router.get('/', async (req, res) => {

    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishBefore != null && req.query.publishBefore != '') {
        query = query.lte('publishDate', req.query.publishBefore);
    }
    if (req.query.publishAfter != null && req.query.publishAfter != '') {
        query = query.gte('publishDate', req.query.publishAfter);
    }
    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }

})

// New book route

router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
})

// creating book route
router.post('/', async (req, res) => {

    const fileName = req.file != null ? req.file.filename : null;

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        //coverImageName: fileName,
        description: req.body.description
    })
    saveCover(book, req.body.cover);
    try {
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`)
        //res.redirect('books')
    } catch {
        // if (book.coverImageName != null) {

        //     removeBookCover(book.coverImageName)
        // }
        renderNewPage(res, book, true);
    }
})

// function removeBookCover(fileName) {
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if (err) console.log(err)
//     })
// }

// show book route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', { book: book })
    } catch {
        res.redirect('/')
    }
})

// edit book route
router.get('/:id/edit', async (req, res) => {

    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);

    }
    catch {
        res.redirect('/')
    }
})

// update book route
router.put('/:id', async (req, res) => {

    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save();
        res.redirect(`/books/${book.id}`)
        //res.redirect('books')
    } catch {
        // if (book.coverImageName != null) {

        //     removeBookCover(book.coverImageName)
        // }
        if (book != null) {
            renderEditPage(res, book, true);
        }
        else {
            redirect('/')
        }
    }
})

// delete book page
router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove();
        res.redirect('/books')
    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        }
        else {
            res.redirect('/')
        }
    }
})
async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', 'creating', hasError)
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', 'editing', hasError)
}
async function renderFormPage(res, book, form, val, hasError = false) {
    try {
        const authors = await Author.find({})

        const params = {
            authors: authors,
            book: book
        };
        if (hasError) params.errorMessage = `Error ${val} Book`
        res.render(`books/${form}`, params);
    } catch {
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded)

    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}
module.exports = router;