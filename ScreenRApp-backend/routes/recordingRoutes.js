const express = require('express');
const router = express.Router();
const {uploadRecording,getAllRecording,getRecordingById,deleteRecordingsById} = require('../controllers/recordingControllers');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

router.post('/upload',upload.single('recording'),uploadRecording);
router.get('/all',getAllRecording);
router.get('/:id',getRecordingById);
router.delete('/:id',deleteRecordingsById);

module.exports = router;