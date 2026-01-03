import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ===============================
// PORTA (OBRIGATÓRIO NO RAILWAY)
// ===============================
const PORT = process.env.PORT || 8080;

// ===============================
// ROTA DE SAÚDE (Railway exige)
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE");
});

// ===============================
// WEBHOOK Z-API
// ===============================
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook recebido:", JSON.stringify(req.body));

    const message =
      req.body?.message?.text ||
      req.body?.text ||
      req.body?.body;

    const phone =
      req.body?.phone ||
      req.body?.from;

    if (!message || !phone) {
      console.log("Mensagem ou telefone inválido");
      return res.sendStatus(200);
    }

    const texto = message.toLowerCase();

    let reply = "Obrigado pela mensagem! Em breve retornamos.";

    if (texto.includes("oi") || texto.includes("olá") || texto.includes("ola")) {
      reply =
        "Olá! 👋😊\n\n" +
        "Sou o atendimento automático da *HSB Elétrica & Renováveis*.\n\n" +
        "Como posso te ajudar?\n" +
        "⚡ Instalações elétricas\n" +
        "☀️ Energia solar\n" +
        "📞 Orçamentos";
    }

    if (
      texto.includes("interesse") ||
      texto.includes("informações") ||
      texto.includes("informacoes")
    ) {
      reply =
        "Perfeito! 😄\n\n" +
        "Para te atender melhor, pode me informar:\n" +
        "1️⃣ Seu nome\n" +
        "2️⃣ Cidade\n" +
        "3️⃣ Tipo de serviço desejado\n\n" +
        "Em instantes nossa equipe retorna 👍";
    }

    // ===============================
    // ENVIO DA RESPOSTA VIA Z-API
    // ===============================
    await axios.post(
      `${process.env.ZAPI_URL}/send-text`,
      {
        phone: phone,
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
  } catch (error) {
    console.error("Erro no webhook:", error.message);
    res.sendStatus(200); // NUNCA retornar erro para Z-API
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});

// ===============================
// TRATAMENTO SIGTERM (Railway)
// ===============================
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido. Encerrando com segurança.");
});
