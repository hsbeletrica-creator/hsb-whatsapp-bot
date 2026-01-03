import express from "express";
import axios from "axios";

const app = express();

// 🔹 Middleware obrigatório
app.use(express.json());

// 🔹 Railway SEMPRE injeta a PORT
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
    console.log("Webhook recebido:", JSON.stringify(req.body));

    const message =
      req.body?.message?.text ||
      req.body?.text ||
      req.body?.body?.text;

    const phone =
      req.body?.phone ||
      req.body?.from ||
      req.body?.body?.phone;

    // Se não for mensagem válida, apenas responde OK
    if (!message || !phone) {
      console.log("Evento ignorado (sem mensagem ou telefone)");
      return res.sendStatus(200);
    }

    // ===============================
    // RESPOSTA AUTOMÁTICA
    // ===============================
    let reply =
      "Olá! 👋😊\n\n" +
      "Obrigado pelo seu contato com a *HSB Elétrica & Renováveis* ⚡🌞\n\n" +
      "Recebemos sua mensagem e em breve um especialista irá te atender.\n\n" +
      "Se preferir, já pode nos dizer:\n" +
      "• Qual serviço você procura\n" +
      "• Sua cidade\n\n" +
      "Ficamos à disposição!";

    // ===============================
    // ENVIO VIA Z-API
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
          "Client-Token": process.env.ZAPI_TOKEN,
        },
      }
    );

    console.log("Resposta enviada com sucesso");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error?.response?.data || error.message);
    // ⚠️ NUNCA devolver erro para a Z-API
    return res.sendStatus(200);
  }
});

// ===============================
// START SERVER (CRÍTICO)
// ===============================
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});

// ===============================
// EVITA SIGTERM
// ===============================
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido. Mantendo serviço ativo.");
});

process.on("SIGINT", () => {
  console.log("SIGINT recebido.");
});
