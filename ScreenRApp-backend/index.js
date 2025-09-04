const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
require('./config/database');
app.get('/',(req ,res)=>{
    res.send('Backend is running');
})

app.use('/api/recordings',require('./routes/recordingRoutes'));
//error handling middleware
app.use((req ,res,next,err)=>{
    res.status(500).send({message: err.message});
})

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
