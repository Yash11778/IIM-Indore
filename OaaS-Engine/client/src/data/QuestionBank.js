export const QUESTIONS = [
    {
        id: 1,
        title: "Level 1: Optimize Trade Session Memory (Easy)",
        difficulty: "Easy",
        timeLimit: 600, // 10 minutes
        description: `
### Problem Statement
The **High-Frequency Trading Terminal** is crashing after 2 hours of accumulated session data. 
Heap analysis confirms the \`TradeSession\` class is retaining stale data records.

### Task
Refactor the \`logTrade\` method to ensure old trade records are flushed.
Keep only the last **5 trades** in memory for the active view.

### Constraints
- \`trades\` array must not exceed length 5.
- The return value (tradeId) must remain unchanged.
        `,
        starterCode: `class TradeSession {
    constructor() {
        this.trades = [];
    }

    logTrade(symbol, price) {
        const trade = {
            id: Date.now(),
            symbol: symbol,
            price: price,
            meta: new Array(1000).fill("market_data")
        };
        
        // BUG: This array grows forever, crashing the terminal!
        this.trades.push(trade);
        
        return trade.id;
    }
}`,
        testCase: (code) => {
            return !code.includes("this.trades.push(trade)") && (code.includes("shift()") || code.includes("splice") || code.includes("slice"));
        }
    },
    {
        id: 2,
        title: "Level 2: High-Frequency Order Throttler (Medium)",
        difficulty: "Medium",
        timeLimit: 900, // 15 minutes
        description: `
### Problem Statement
We need to prevent algorithmic spam from crashing the **Order Matching Engine**.
Implement a \`OrderThrottler\` that allows **3 orders per second** per trader.

### Task
Complete the \`allowOrder(traderId)\` method.
- Return \`true\` if order is accepted.
- Return \`false\` if limit is exceeded (Reject Algo Spam).

### Example
\`\`\`js
throttler.allowOrder('trader1'); // true
throttler.allowOrder('trader1'); // true
throttler.allowOrder('trader1'); // true
throttler.allowOrder('trader1'); // false (4th order rejected)
\`\`\`
        `,
        starterCode: `class OrderThrottler {
    constructor() {
        this.requests = {};
    }

    allowOrder(traderId) {
        const now = Date.now();
        
        // TODO: Implement rate limiting to protect the engine
        
        return true; 
    }
}`,
        testCase: (code) => code.includes("Date.now()") && code.includes("if")
    },
    {
        id: 3,
        title: "Level 3: Low-Latency Order Router (Hard)",
        difficulty: "Hard",
        timeLimit: 1200, // 20 minutes
        description: `
### Problem Statement
Implement a Round-Robin Router that skips **High-Latency (Unhealthy)** execution nodes.
We cannot afford to send orders to laggy nodes.

### Task
Complete the \`getExecutionNode()\` method.
- Nodes have a \`healthy\` property (Low Latency = True).
- You must skip unhealthy nodes.
- Distribute orders evenly among healthy ones.

### Input
\`nodes = [{id:1, healthy:true}, {id:2, healthy:false}, {id:3, healthy:true}]\`
### Expected Output Sequence
\`Node 1 -> Node 3 -> Node 1 -> ...\`
        `,
        starterCode: `class OrderRouter {
    constructor(nodes) {
        this.nodes = nodes;
        this.currentIndex = 0;
    }

    getExecutionNode() {
        // TODO: Return the next HEALTHY execution node
        // If no nodes are healthy, return null
        
        return null;
    }
}`,
        testCase: (code) => code.includes("healthy") && (code.includes("while") || code.includes("for"))
    }
];
