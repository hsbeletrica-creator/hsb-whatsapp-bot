import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Railway SEMPRE usa PORT dinâmica
const PORT = process.env.PORT;

// ===============================
// ROTA DE SAÚDE (OBRIGATÓRIA)
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE");
});

// ===============================
// WEBHOOK Z-API
// ===============================
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.message?.text;
    const phone = req.body?.phone;

    // Se não for mensagem válida, responde OK e sai
    if (!message || !phone) {
      return res.sendStatus(200);
    }

    // ===============================
    // OPENAI (NOVA API)
    // ===============================
    const ai = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é o atendimento automático da HSB Elétrica e Renováveis. Seja educado, profissional e direto.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      ai.data.choices?.[0]?.message?.content ||
      "Obrigado pela mensagem! Em breve retornamos.";

    // ===============================
    // ENVIO RESPOSTA VIA Z-API
    // ===============================
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
    res.sendStatus(200); // NUNCA devolver erro para Z-API
  }
});

// ===============================
// START SERVER
// ===============================
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});

// ===============================
// TRATAMENTO DE SIGTERM (CRÍTICO)
// ===============================
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido. Mantendo serviço ativo...");
});
