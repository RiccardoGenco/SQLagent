const OpenAI = require('openai');

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function generateQuery(userMessage) {
    const systemPrompt = `
    You are a helpful assistant that converts natural language into SQL queries for a SQLite database.
    The database has the following tables:
    - users (id, name, email, password, role)
    - products (id, name, price, stock)
    - chat_logs (id, sender, message, timestamp, metadata)

    Return ONLY the SQL query. Do not include markdown formatting (like \`\`\`sql). Do not include explanations.
    
    IMPORTANT RULES:
    1. When searching for text (names, emails, products), ALWAYS use 'LIKE' with wildcards (%) instead of exact match (=).
    2. Make searches case-insensitive (e.g. WHERE name LIKE '%keyboard%').
    3. If the request is unrelated to the database or you cannot answer, return "Non ho capito la tua richiesta".
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.DEFAULT_MODEL || "anthropic/claude-3-haiku",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            max_tokens: 150,
        });

        let sql = completion.choices[0].message.content.trim();
        // Clean up markdown if the model ignores instructions
        sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
        return sql;
    } catch (error) {
        console.error("AI Service Error:", error);
        // Fallback or rethrow
        throw new Error("Failed to generate query from AI");
    }
}

module.exports = {
    generateQuery
};
