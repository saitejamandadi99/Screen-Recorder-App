const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname,'screenrapp.db');
const db = new sqlite3.Database(dbPath,(err)=>{
    if(err){
        console.error('Error connecting to database:',err.message);
    }else{
        console.log('Connected to SQLite database.');
        }
})

db.run(`
    create table if not exists recordingsSaves(
        id integer primary key autoincrement,
        filename text,
        filepath text,
        filesize integer,
        createdAt datetime default current_timestamp)`,(err)=>{
            if(err){
                console.error('Error creating table:',err.message);
            }else{
                console.log('Table recordingsSaves is ready.');
            }});

module.exports = db;