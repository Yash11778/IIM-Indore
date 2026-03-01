require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5002; // Hardcoded to bypass blocked 5001

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const simulationRoutes = require('./routes/simulationRoutes');
app.use('/api/simulation', simulationRoutes);

// DATABASE CONNECTION (Local Persistence Fallback)
// Try connecting to MongoDB. If it fails (due to DNS/Firewall), we switch to LocalFileDB.
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 2000 // Fail fast
}).then(() => {
    console.log("✅ MongoDB Connected (Cloud Mode)");
    global.mongoConnected = true;
}).catch(err => {
    console.warn("⚠️  MongoDB Connection Failed:", err.message);
    console.log("🚀 Switching to SQLITE STORAGE (oaas.db). Cloud features disabled.");
    global.mongoConnected = false;
});

app.get('/', (req, res) => {
    res.send('OaaS Engine API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
