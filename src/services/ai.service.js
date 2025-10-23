const { GoogleGenerativeAI } = require("@google/generative-ai"); // Pehle yahan 'GoogleGenAI' tha, maine 'GoogleGenerativeAI' kiya hai, check kar lena aapki library ka sahi naam.

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // API key ko object mein paas karne ka tareeka update kiya

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

  let response; // <<-- Yahan 'response' ko declare kiya taaki woh 'catch' block mein bhi accessible rahe.

  try {
    response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent({ // Model ka naam "gemini-2.5-flash" se "gemini-1.5-flash" kiya aur getGenerativeModel() use kiya
      contents: [{ role: "user", parts: [{ text: formattedPrompt }] }],
    });
  } catch (error) {
    console.error("Error generating content from AI:", error);
    // Yahan aap error ko theek se handle kar sakte hain,
    // jaise ek user-friendly message return karna ya error ko re-throw karna.
    throw new Error("Failed to generate content from AI due to an internal error.");
  }


  // safe check
  if (
    response && // Ab 'response' hamesha defined hoga
    response.response && // Gemini-1.5-flash ke naye SDK ke liye 'response.response' ka use
    response.response.candidates &&
    response.response.candidates[0] &&
    response.response.candidates[0].content &&
    response.response.candidates[0].content.parts &&
    response.response.candidates[0].content.parts[0]
  ) {
    let text = response.response.candidates[0].content.parts[0].text; // 'response.response' use kiya

    // ✅ Post-processing: sirf required concise block nikaal lo
    const match = text.match(/Bad Code:[\s\S]*?Improvements:[\s\S]*/);
    return match ? match[0].trim() : text.trim();
  } else {
    // Agar AI response successful tha lekin expected format mein nahi aaya
    throw new Error("AI response invalid ya empty hai after successful generation.");
  }
}

module.exports = generateContent;




