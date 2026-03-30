import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

function extractText(data) {
  try {
    const parts = data?.output?.[0]?.content;
    if (!Array.isArray(parts)) return "";

    const texts = parts
      .filter((item) => item.type === "output_text" || item.text)
      .map((item) => item.text || "")
      .filter(Boolean);

    return texts.join("\n").trim();
  } catch (e) {
    return "";
  }
}

app.post("/gpt", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    if (!userMessage.trim()) {
      return res.json({
        answer: "Будь ласка, напиши питання."
      });
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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
      return res.status(500).json({
        answer: `OpenAI error ${response.status}: ${data?.error?.message || "невідома помилка"}`
      });
    }

    const answer = extractText(data) || "Немає відповіді";

    return res.json({ answer });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      answer: "Сталася помилка на сервері."
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
