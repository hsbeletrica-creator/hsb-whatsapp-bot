import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Rota de saúde (ESSENCIAL para o Railway)
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE");
});

// Webhook da Z-API
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.message?.text;
    const phone = req.body?.phone;

    if (!message || !phone) {
      return res.sendStatus(200);
    }

    const ai = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um atendente profissional da HSB Elétrica e Renováveis.",
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = ai.data.choices[0].message.content;

    await axios.post(
      `${process.env.ZAPI_URL}/send-text`,
      {
        phone,
        message: reply,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Client-Token": process.env.ZAPI_TOKEN,
        },
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Erro no webhook:", err.message);
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});
