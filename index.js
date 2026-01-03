import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// ================================
// ROTA DE SAÚDE (Railway)
// ================================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE 🚀");
});

// ================================
// EXTRATOR UNIVERSAL DE TEXTO Z-API
// ================================
function getMessageText(body) {
  if (!body) return null;

  if (typeof body === "string") return body;

  if (typeof body.message === "string") return body.message;
  if (typeof body.body === "string") return body.body;

  if (typeof body.text === "string") return body.text;
  if (typeof body.text?.message === "string") return body.text.message;

  if (typeof body.message?.text === "string") return body.message.text;

  return null;
}

// ================================
// EXTRATOR UNIVERSAL DE TELEFONE
// ================================
function getPhone(body) {
  return (
    body?.phone ||
    body?.from ||
    body?.sender ||
    body?.participant ||
    null
  );
}

// ================================
// WEBHOOK Z-API
// ================================
app.post("/webhook", async (req, res) => {
  try {
    const phone = getPhone(req.body);
    const message = getMessageText(req.body);

    if (!phone || !message) {
      console.log("Evento ignorado (sem mensagem válida)");
      return res.sendStatus(200);
    }

    const text = message.toString().toLowerCase();
    console.log("Mensagem recebida:", text);

    let reply =
      "Olá! 👋\n\nObrigado pelo contato.\nEm breve retornaremos.";

    if (text.includes("oi") || text.includes("olá")) {
      reply =
        "Olá! 👋\n\nBem-vindo à *HSB Elétrica & Renováveis* ⚡☀️\n\nComo posso te ajudar?";
    }

    if (
      text.includes("interesse") ||
      text.includes("informações") ||
      text.includes("informacao")
    ) {
      reply =
        "Perfeito! 😊\n\nPara te atender melhor, informe:\n\n1️⃣ Cidade\n2️⃣ Tipo de serviço\n3️⃣ Residencial ou comercial";
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
  } catch (err) {
    console.error("Erro no webhook:", err.message);
    return res.sendStatus(200); // NUNCA derrubar o serviço
  }
});

// ================================
// START SERVER
// ================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});

// ================================
// SHUTDOWN SEGURO
// ================================
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido. Encerrando com segurança.");
});
