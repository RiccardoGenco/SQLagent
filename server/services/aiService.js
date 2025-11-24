const OpenAI = require('openai');

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function generateQuery(userMessage, schemaContext) {
    const systemPrompt = `
    You are a SQL assistant for SQLite.
    Tables:
    ${schemaContext}

    Return ONLY the SQL query. No markdown. No explanations.
    Rules:
    1. Text search: use 'LIKE' with wildcards (%), case-insensitive.
    2. Unrelated/Unanswerable: return "SELECT 1".
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
        sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();

        const usage = completion.usage; // { prompt_tokens, completion_tokens, total_tokens }

        return { sql, usage };
    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("Failed to generate query from AI");
    }
}

module.exports = {
    generateQuery
};
