const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateContent(prompt) {
  const formattedPrompt = `
    You are a senior code reviewer. Your task is to analyze the following code.
    Respond STRICTLY in this format only. Do not add any extra explanation or examples.
    
    Bad Code:
    [original code]

    Issues:
    [short bullet points only]

    Recommended Fix:
    [corrected code]

    Improvements:
    [2–3 short bullets only]

    Original Code to review:
    \`\`\`javascript
    ${prompt}
    \`\`\`
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: formattedPrompt }] }],
  });

  // safe check
  if (
    response &&
    response.candidates &&
    response.candidates[0] &&
    response.candidates[0].content &&
    response.candidates[0].content.parts &&
    response.candidates[0].content.parts[0]
  ) {
    let text = response.candidates[0].content.parts[0].text;

    // ✅ Post-processing: sirf required concise block nikaal lo
    const match = text.match(/Bad Code:[\s\S]*?Improvements:[\s\S]*/);
    return match ? match[0].trim() : text.trim();
  } else {
    throw new Error("AI response invalid ya empty hai");
  }
}

module.exports = generateContent;




