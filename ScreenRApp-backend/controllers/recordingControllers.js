const db = require('../config/database');
const cloudinary = require('../config/cloudinary');
const fs = require('fs'); // to delete local files

// Upload recording to Cloudinary and save metadata in DB
const uploadRecording = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'File is required' });

    const { path: filepath, originalname: filename, size: filesize } = file;

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filepath, { resource_type: 'video' });

    // Deleting local temp file
    fs.unlinkSync(filepath);

    // Save metadata in SQLite
    db.run(
      `INSERT INTO recordingsSaves (filename, filepath, filesize) VALUES (?, ?, ?)`,
      [filename, result.secure_url, filesize],
      function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({
          message: 'Recording uploaded successfully',
          data: {
            id: this.lastID,
            filename,
            filepath: result.secure_url,
            filesize
          }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all recordings
const getAllRecordings = (req, res) => {
  db.all(`SELECT * FROM recordingsSaves ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    if( rows.length === 0) return res.status(404).json({ message: 'No recordings found' });
    res.status(200).json({ data: rows });
  });
};

// Get recording by ID
const getRecordingById = (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'ID is required' });

  db.get(`SELECT * FROM recordingsSaves WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(404).json({ message: 'Recording not found' });
    res.status(200).json({ data: row });
  });
};

// Delete recording by ID
const deleteRecordingById = (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'ID is required' });

  db.get(`SELECT * FROM recordingsSaves WHERE id = ?`, [id], async (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(404).json({ message: 'Recording not found' });

    const filepath = row.filepath;

    // Robust extraction of public_id from Cloudinary URL
    let publicId;
    try {
      // Remove query params if any
      const urlWithoutQuery = filepath.split('?')[0];
      // Get last part after '/' and remove extension
      publicId = urlWithoutQuery.split('/').pop().split('.')[0];
    } catch {
      return res.status(500).json({ message: 'Invalid file path' });
    }

    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

      // Delete from SQLite
      db.run(`DELETE FROM recordingsSaves WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json({ message: 'Recording deleted successfully' });
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
};

module.exports = {
  uploadRecording,
  getAllRecordings,
  getRecordingById,
  deleteRecordingById
};
