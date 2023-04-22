const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator')

// Route 1: Get all the notes using: get '/api/notes/fetchallnotes'. login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error!')
    }

})

// Route 2: add a new note using: post '/api/notes/addnote'. login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title!').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters!').isLength({ min: 5 }),
], async (req, res) => {
    try {

        const { title, description, tag } = req.body
        // if there are errors, reeturn bad request and the errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error!')
    }

})

// Route 3: updating a note using: put '/api/notes/updatenote/:id'. login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body

    try {
        // create a newNote object
        const newNote = {}
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // find a note to be updated and update it
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(401).send("Not found!")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed!")
        }


        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error!')
    }



})

// Route 4: deleting a note using: delete '/api/notes/deletenote/:id'. login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    
    try {
        // find a note to be deleted and delete it
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).send("Not found!")
        }

        // allow deletion only if user owns it
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not allowed!")
        }


        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "success": "note has been deleted!" })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error!')
    }



})

module.exports = router
