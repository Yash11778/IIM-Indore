const mongoose = require('mongoose');

const TurnSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Evaluative metadata for this specific turn
  metadata: {
    responseData: String, // Internal thought/audit from AI
    reactionTime: Number, // ms taken to respond
    sentimentScore: Number, // -1 to 1
    stressLevelDetected: String // 'Low', 'Medium', 'High'
  }
});

const SimulationSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String, // e.g., 'Product Management', 'Full Stack Dev'
    required: true
  },
  difficultyLevel: {
    type: String,
    enum: ['Junior', 'Mid-Senior', 'Lead'],
    default: 'Mid-Senior'
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Terminated'],
    default: 'Active'
  },
  conversationHistory: [TurnSchema],

  // Aggregate Metrics for the Report
  auditMetrics: {
    technicalAccuracyClass: { type: Number, default: 0 }, // 0-100
    behavioralComposureScore: { type: Number, default: 0 }, // 0-100
    communicationClarityScore: { type: Number, default: 0 }, // 0-100
    hiringRiskScore: { type: String, default: 'Pending' }, // 'Low', 'Medium', 'High'
    focusIntegrity: { type: Number, default: 100 } // NEW: Anti-Cheating Score
  },

  startedAt: { type: Date, default: Date.now },
  completedAt: Date
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  profileSummary: String,
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SimulationSession' }]
});

const SessionModel = mongoose.model('SimulationSession', SimulationSessionSchema);
const UserModel = mongoose.model('User', UserSchema);

module.exports = { SessionModel, UserModel };
