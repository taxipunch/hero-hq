const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').find(l => l.startsWith('ANTHROPIC_API_KEY='));
const apiKey = env ? env.split('=')[1].trim() : null;

async function main() {
    console.log("Key found:", !!apiKey);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
        })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
