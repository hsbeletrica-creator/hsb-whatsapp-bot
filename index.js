import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ================================
// PORTA OBRIGATÓRIA DO RAILWAY
// ================================
const PORT = process.env.PORT || 8080;

// ================================
// ROTA DE SAÚDE (OBRIGATÓRIA)
// ================================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE");
});

// ================================
// WEBHOOK Z-API
// ================================
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.message?.text;
    const phone = req.body?.phone;

    // Se não for mensagem válida, apenas confirma
    if (!message || !phone) {
      return res.sendStatus(200);
    }

    // ================================
    // CHAMADA À OPENAI (API NOVA)
    // ================================
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply =
      aiResponse.data.choices?.[0]?.message?.content ||
      "Obrigado pela mensagem! Em breve retornamos.";

    // ================================
    // ENVIO DA RESPOSTA VIA Z-API
    // ================================
    await axios.post(
      `${process.env.ZAPI_URL}/send-text`,
      {
        phone,
        message: reply,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Client-Token": process.env.zapi_token,
        },
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error.message);
    // NUNCA devolver erro para a Z-API
    res.sendStatus(200);
  }
});

// ================================
// START DO SERVIDOR (SEM SIGTERM)
// ================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});
