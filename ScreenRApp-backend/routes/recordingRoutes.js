const express = require('express');
const router = express.Router();
const {uploadRecording,getAllRecording,getRecordingById,deleteRecordingsById} = require('../controllers/recordingControllers');

router.post('/upload',uploadRecording);
router.get('/all',getAllRecording);
router.get('/:id',getRecordingById);
router.delete('/:id',deleteRecordingsById);