import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/gpt", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const prompt = `
Ти — AI-асистент для онбордингу медичних представників.
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
        model: "gpt-5.3",
        input: prompt
      })
    });

    const data = await response.json();

    res.json({
      answer: data.output_text || "Немає відповіді"
    });

  } catch (e) {
    res.json({ answer: "Помилка 😢" });
  }
});

app.listen(3000, () => console.log("Server started"));
