import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ===============================
// CONFIGURAÇÕES
// ===============================
const PORT = process.env.PORT;
const ZAPI_URL = process.env.ZAPI_URL;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;

if (!PORT) {
  console.error("❌ PORT não definida");
  process.exit(1);
}

// ===============================
// ROTA DE SAÚDE (OBRIGATÓRIA)
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE 🚀");
});

// ===============================
// WEBHOOK Z-API
// ===============================
app.post("/webhook", async (req, res) => {
  try {
    const message =
      req.body?.message?.text ||
      req.body?.text ||
      "";

    const phone =
      req.body?.phone ||
      req.body?.from ||
      "";

    if (!message || !phone) {
      return res.sendStatus(200);
    }

    const text = message.toLowerCase();

    let reply =
      "Obrigado pela mensagem! Em breve retornaremos com mais informações 😊";

    if (
      text.includes("oi") ||
      text.includes("olá") ||
      text.includes("ola")
    ) {
      reply =
        "Olá! 👋 Somos da HSB Elétrica & Renováveis ⚡🌞\n\nTrabalhamos com:\n• Instalações elétricas\n• Energia solar\n• Manutenção residencial e comercial\n\nComo podemos te ajudar?";
    }

    if (
      text.includes("interesse") ||
      text.includes("informações") ||
      text.includes("informacoes")
    ) {
      reply =
        "Perfeito! 😊\n\nPara te ajudar melhor, pode nos informar:\n• Tipo de serviço\n• Cidade\n• Se é residencial ou comercial\n\nAssim retornamos rapidamente!";
    }

    // ===============================
    // ENVIO VIA Z-API
    // ===============================
    await axios.post(
      `${ZAPI_URL}/send-text`,
      {
        phone,
        message: reply,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Client-Token": ZAPI_TOKEN,
        },
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error.message);
    res.sendStatus(200); // NUNCA retornar erro para a Z-API
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ HSB bot rodando na porta ${PORT}`);
});

// ===============================
// SIGTERM (Railway)
// ===============================
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM recebido. Railway está reiniciando o serviço.");
});
