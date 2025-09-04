const express = require('express');
const router = express.Router();
const {uploadRecording,getAllRecordings,getRecordingById,deleteRecordingById} = require('../controllers/recordingControllers');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

router.post('/upload',upload.single('recording'),uploadRecording);
router.get('/all',getAllRecordings);
router.get('/:id',getRecordingById);
router.delete('/:id',deleteRecordingById);

module.exports = router;