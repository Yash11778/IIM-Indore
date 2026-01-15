const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const simulationRoutes = require('./routes/simulationRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/simulation', simulationRoutes);

// Database Connection
global.mongoConnected = false;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/oaas_engine', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    global.mongoConnected = true;
}).catch(err => {
    console.log('⚠️ MongoDB not available. Starting in IN-MEMORY MODE (Data will be lost on restart).');
    global.mongoConnected = false;
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
