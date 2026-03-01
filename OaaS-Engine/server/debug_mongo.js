require('dotenv').config();
const mongoose = require('mongoose');

console.log("--- Advanced MongoDB Diagnostic ---");
const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("❌ MONGO_URI missing.");
    process.exit(1);
}

const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log(`📡 Original URI: ${maskedUri}`);

// Helper to test connection
const testConnection = async (name, connectionUri, options = {}) => {
    console.log(`\n🧪 Testing Strategy: ${name}`);
    try {
        await mongoose.connect(connectionUri, {
            serverSelectionTimeoutMS: 3000,
            ...options
        });
        console.log(`✅ SUCCESS! Strategy '${name}' worked.`);
        return true;
    } catch (err) {
        console.log(`❌ FAILED (${name}). Error: ${err.message}`);
        return false;
    } finally {
        await mongoose.disconnect();
    }
};

const dns = require('dns');

(async () => {
    // 0. DNS Check
    console.log("\n🔍 Checking DNS Resolution for Cluster...");
    const hostname = 'cluster0.6jvi4hh.mongodb.net';
    try {
        const addresses = await dns.promises.resolve(hostname); // Try A record first (rare for SRV root but good check)
        console.log(`✅ DNS Resolved A/CNAME: ${JSON.stringify(addresses)}`);
    } catch (e) {
        console.log(`⚠️ DNS A/CNAME Lookup failed: ${e.code}`);
    }

    try {
        const srvs = await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
        console.log(`✅ DNS Resolved SRV: ${JSON.stringify(srvs)}`);
    } catch (e) {
        console.log(`❌ DNS SRV Lookup failed (CRITICAL): ${e.code}`);
        if (e.code === 'ENOTFOUND' || e.code === 'SERVFAIL') {
            console.log("💡 SOLUTION: Your network cannot resolve MongoDB addresses. Try using a mobile hotspot or changing DNS to 8.8.8.8.");
            process.exit(1);
        }
    }

    // 1. Standard Attempt
    if (await testConnection("Standard", uri)) process.exit(0);

    // 2. TLS Insecure (SSL Interception?)
    if (await testConnection("TLS Insecure", uri, { tls: true, tlsInsecure: true })) process.exit(0);

    // 3. Auto-Encode Special Characters in Password
    const match = uri.match(/^(mongodb\+srv:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (match) {
        const [_, protocol, user, rawPassword, host] = match;
        const encodedPassword = encodeURIComponent(rawPassword);
        if (rawPassword !== encodedPassword) {
            const encodedUri = `${protocol}${user}:${encodedPassword}@${host}`;
            console.log(`\nℹ️  Detected special characters. Trying encoded password.`);
            if (await testConnection("URL Encoded Password", encodedUri)) {
                console.log("\n💡 SOLUTION: Password encoding required.");
                console.log(encodedUri);
                process.exit(0);
            }
        }
    }

    console.log("\n❌ All automated strategies failed. This implies a specific Network Firewall (Deep Packet Inspection) or Invalid Credentials.");
    process.exit(1);
})();
