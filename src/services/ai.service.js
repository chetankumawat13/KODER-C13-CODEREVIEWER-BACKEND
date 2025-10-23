const { GoogleGenerativeAI } = require("@google/generative-ai"); 

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 

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

  let response; 

  try {
    response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent({ 
      contents: [{ role: "user", parts: [{ text: formattedPrompt }] }],
    });
  } catch (error) {
    console.error("Error generating content from AI:", error);
    throw new Error("Failed to generate content from AI due to an internal error.");
  }


  // safe check
  if (
    response &&
    response.candidates &&
    response.candidates[0] &&
    response.candidates[0].content &&
    response.candidates[0].content.parts &&
    response.candidates[0].content.parts[0]
  ) {
    const text = response.candidates[0].content.parts[0].text;
    const match = text.match(/Bad Code:[\s\S]*?Improvements:[\s\S]*/);
    return match ? match[0].trim() : text.trim();
  } else {
    throw new Error("AI response invalid ya empty hai after successful generation.");
  }
}

module.exports = generateContent;




