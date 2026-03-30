import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/gpt", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    if (!userMessage.trim()) {
      return res.json({ answer: "Порожнє повідомлення" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        input: `Відповідай українською. Питання: ${userMessage}`
      })
    });

    const data = await response.json();

    return res.json({
      answer: JSON.stringify(
        {
          message_received: userMessage,
          status: response.status,
          data: data
        },
        null,
        2
      ).slice(0, 3000)
    });
  } catch (error) {
    return res.json({
      answer: `SERVER ERROR: ${String(error)}`
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
