import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Railway SEMPRE fornece a porta
const PORT = process.env.PORT;

// ================================
// ROTA DE SAÚDE (OBRIGATÓRIA)
// ================================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE 🚀");
});

// ================================
// FUNÇÃO SEGURA PARA PEGAR TEXTO
// ================================
function extractMessageText(body) {
  if (!body) return null;

  // Casos mais comuns da Z-API
  if (typeof body.text === "string") return body.text;
  if (typeof body.message === "string") return body.message;
  if (typeof body.message?.text === "string") return body.message.text;
  if (typeof body.body === "string") return body.body;

  return null;
}

// ================================
// WEBHOOK Z-API
// ================================
app.post("/webhook", async (req, res) => {
  try {
    const phone =
      req.body?.phone ||
      req.body?.from ||
      req.body?.sender ||
      null;

    const message = extractMessageText(req.body);

    // Se não for mensagem válida, apenas confirma
    if (!phone || !message) {
      console.log("Evento ignorado (sem mensagem válida)");
      return res.sendStatus(200);
    }

    const text = message.toString().toLowerCase();

    let reply =
      "Olá! 👋\n\nObrigado pela mensagem.\nEm breve retornaremos com mais informações.";

    if (text.includes("oi") || text.includes("olá")) {
      reply =
        "Olá! 👋\n\nObrigado pelo contato com a *HSB Elétrica & Renováveis* ⚡☀️\n\nComo posso te ajudar?";
    }

    if (
      text.includes("interesse") ||
      text.includes("informações") ||
      text.includes("informacao")
    ) {
      reply =
        "Perfeito! 😊\n\nPara te ajudar melhor, pode me dizer:\n\n1️⃣ Cidade\n2️⃣ Tipo de serviço (elétrica, solar, manutenção)\n3️⃣ Residencial ou comercial?";
    }

    // ================================
    // ENVIO VIA Z-API
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
          "Client-Token": process.env.ZAPI_TOKEN,
        },
      }
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error.message);
    return res.sendStatus(200); // NUNCA derrubar o container
  }
});

// ================================
// START SERVER
// ================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});

// ================================
// TRATAMENTO DE ENCERRAMENTO
// ================================
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido. Serviço encerrando com segurança.");
});
