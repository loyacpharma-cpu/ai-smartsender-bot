import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

function extractText(data) {
  try {
    if (!data || !Array.isArray(data.output)) return "";

    const texts = [];

    for (const item of data.output) {
      if (item.type === "message" && Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part.type === "output_text" && part.text) {
            texts.push(part.text);
          }
        }
      }
    }

    return texts.join("\n").trim();
  } catch {
    return "";
  }
}

app.post("/gpt", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    if (!userMessage.trim()) {
      return res.json({ answer: "Будь ласка, напиши питання." });
    }

    const prompt = `
Ти — AI-асистент для онбордингу нових медичних представників.
Відповідай українською, просто і структуровано.

Питання:
${userMessage}
`;

 const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-5.4-mini",
    input: prompt
  })
});

const data = await response.json();

console.log("OPENAI STATUS:", response.status);
console.log("OPENAI DATA:", JSON.stringify(data, null, 2));

if (!response.ok) {
  return res.json({
    answer: `OpenAI error ${response.status}: ${data?.error?.message || "невідома помилка"}`
  });
}

const answer = extractText(data) || "Немає відповіді";
res.json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ answer: "Сталася помилка на сервері." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
