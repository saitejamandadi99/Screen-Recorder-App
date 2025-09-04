const db = require('../config/database');
const cloudinary = require('../config/cloudinary');
const fs = require('fs') //file system to delete the file after uploading to cloudinary 

//upload the recording to cloudinary and save the details to sqlite database
const uploadRecording = async (req,res)=>{
    try{
        const {filename,filepath,filesize} = req.body;
        if (!filename || !filepath || !filesize){
            return res.status(400).send({message:'All fields are required'});
        }
        const result = await cloudinary.uploader.upload(filepath,{resource_type:'video'});
        fs.unlinkSync(filepath); // to delete the file after uploading to cloudinary
        db.run(`insert into recordingsSaves (filename,filepath,filesize) values(?,?,?)`,
        [filename,result.secure_url,filesize],(err)=>{
            if(err){
                return res.status(500).send({message:err.message});
            }else{
                return res.status(201).send({message:'Recording uploaded successfully',data:{id:this.lastID,filename,filepath:result.secure_url,filesize}});
            }
        })
    }
    catch(err){
        res.status(500).send({message:err.message});
    }

}

//get all recording from the database
const getAllRecording = (req , res)=>{
    db.all(`select * from recordingsSaves order by createdAt desc`,[],(err,rows)=>{
        if(err){
            return res.status(500).send({message:err.message});
        }
        return res.status(200).send({data:rows});
    })
}
//get recording by id from the database
const getRecordingById = (req, res)=>{
    const id = req.params.id; 
    if (!id){
        return res.status(400).send({message:'ID is required'});
    }
    db.get(`select * from recordingsSaves where id = ?`,[id],(err,row)=>{ 
        if(err){
            return res.status(500).send({message:err.message});
        }
        if(!row){
            return res.status(404).send({message:'Recording not found'});
        }
        return res.status(200).send({data:row});
    });
}

//delete recording by id from the database

const deleteRecordingsById = (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  db.get(`SELECT * FROM recordingsSaves WHERE id = ?`, [id], async (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(404).json({ message: 'Recording not found' });

    const filepath = row.filepath;

    // Extracting public_id safely
    let publicId;
    try {
      const parts = filepath.split('/');
      const filename = parts[parts.length - 1]; //to get last part of URL
      publicId = filename.split('.')[0]; // remove extension
    } catch {
      return res.status(500).json({ message: 'Invalid file path' });
    }

    try {
      // Delete the file  from Cloudinary
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

      // Deleting from DB
      db.run(`DELETE FROM recordingsSaves WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        return res.status(200).json({ message: 'Recording deleted successfully' });
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
};

module.exports = { uploadRecording, getAllRecording, getRecordingById, deleteRecordingsById };
