import express from "express";
import axios from "axios";

const app = express();

/**
 * Middleware obrigatório
 */
app.use(express.json());

/**
 * Railway injeta PORT automaticamente
 * fallback é OBRIGATÓRIO
 */
const PORT = process.env.PORT || 8080;

/**
 * ===============================
 * ROTA DE SAÚDE (CRÍTICA)
 * ===============================
 */
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE");
});

/**
 * ===============================
 * WEBHOOK DA Z-API
 * ===============================
 */
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook recebido:", JSON.stringify(req.body));

    const message =
      req.body?.message?.text ||
      req.body?.text ||
      req.body?.body?.text ||
      "";

    const phone =
      req.body?.phone ||
      req.body?.from ||
      req.body?.body?.phone ||
      "";

    if (!message || !phone) {
      return res.sendStatus(200);
    }

    /**
     * RESPOSTA AUTOMÁTICA
     */
    const reply =
      "Olá! 👋😊\n\n" +
      "Obrigado por entrar em contato com a *HSB Elétrica & Renováveis* ⚡🌞\n\n" +
      "Recebemos sua mensagem e em breve nossa equipe irá te atender.\n\n" +
      "Se quiser adiantar, nos informe:\n" +
      "• Qual serviço você procura\n" +
      "• Sua cidade\n\n" +
      "Estamos à disposição!";

    /**
     * ENVIO VIA Z-API
     */
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
        timeout: 10000,
      }
    );

    console.log("Mensagem enviada com sucesso");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error.message);
    // ⚠️ NUNCA devolver erro para a Z-API
    return res.sendStatus(200);
  }
});

/**
 * ===============================
 * START SERVER (OBRIGATÓRIO)
 * ===============================
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});

/**
 * ===============================
 * EVITA FINALIZAÇÃO DO CONTAINER
 * ===============================
 */
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido — ignorado para manter o serviço ativo");
});

process.on("SIGINT", () => {
  console.log("SIGINT recebido");
});
