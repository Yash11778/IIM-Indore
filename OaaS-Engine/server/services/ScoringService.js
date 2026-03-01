/**
 * B-TRA (Behavioral & Technical Readiness Audit) Engine
 * Calculates the "Hiring Risk Score" based on candidate telemetry.
 */

const WEIGHTS = {
    TECHNICAL: 0.4,
    BEHAVIORAL: 0.4,
    FOCUS: 0.2
};

class ScoringService {
    constructor() {
        // Thresholds
        this.MAX_RISK = 100; // Do not hire
        this.MIN_RISK = 0;   // Hire immediately
    }

    /**
     * @param {Object} telemetry 
     * @param {number} telemetry.stressEvents - Count of stress triggers (time, vagueness)
     * @param {number} telemetry.focusIntegrity - 0-100 score from frontend
     * @param {number} telemetry.stagesCompleted - How many stages finished (0-4)
     * @param {boolean} telemetry.codeQualityPass - Did they pass the chaos test?
     * @returns {Object} Scorecard
     */
    calculateScorecard(telemetry) {
        const { stressEvents, focusIntegrity, stagesCompleted, codeQualityPass } = telemetry;

        // 1. Technical Score (0-100)
        // Completion of stages is the main driver.
        let techScore = (stagesCompleted / 4) * 80;
        if (codeQualityPass) techScore += 20;

        // 2. Behavioral Score (0-100)
        // Starts at 100, drops with stress events.
        let behavioralScore = 100 - (stressEvents * 15);
        if (behavioralScore < 0) behavioralScore = 0;

        // 3. Focus Score (0-100)
        // Direct feed from biometric mock.
        let focusScore = focusIntegrity || 100;

        // --- HIRE RISK CALCULATION ---
        // We want a Risk Score. Low is Good.
        // Convert Readiness (High Good) to Risk (Low Good).

        const techRisk = 100 - techScore;
        const behaviorRisk = 100 - behavioralScore;
        const focusRisk = 100 - focusScore;

        const totalRisk = Math.round(
            (techRisk * WEIGHTS.TECHNICAL) +
            (behaviorRisk * WEIGHTS.BEHAVIORAL) +
            (focusRisk * WEIGHTS.FOCUS)
        );

        // Determination
        let status = "REJECT";
        if (totalRisk < 30) status = "HIRE";
        else if (totalRisk < 60) status = "CONSIDER";

        return {
            hiringRiskScore: totalRisk,
            status: status,
            breakdown: {
                technical: techScore,
                behavioral: behavioralScore,
                focus: focusScore
            },
            notes: this.generateNotes(status, behaviorRisk, focusRisk)
        };
    }

    generateNotes(status, behaviorRisk, focusRisk) {
        if (status === "HIRE") return "Strong candidate. High resilience and technical throughput.";
        if (focusRisk > 50) return "Rejected due to low focus integrity (excessive tab switching).";
        if (behaviorRisk > 60) return "Technically capable but showed poor stress management.";
        return "Candidate lacked sufficient technical progress.";
    }
}

module.exports = new ScoringService();
