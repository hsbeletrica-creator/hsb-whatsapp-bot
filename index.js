import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Railway SEMPRE usa porta dinâmica
const PORT = process.env.PORT;

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
    const message =
      req.body?.message?.text?.toLowerCase()?.trim() || "";
    const phone = req.body?.phone;

    // Se não houver mensagem ou telefone, ignora
    if (!message || !phone) {
      return res.sendStatus(200);
    }

    console.log("Mensagem recebida:", message);

    let reply =
      "Obrigado pela mensagem! Em breve um atendente retornará. 😊";

    // ================================
    // RESPOSTAS AUTOMÁTICAS
    // ================================
    if (
      message.includes("oi") ||
      message.includes("olá") ||
      message.includes("ola") ||
      message.includes("bom dia") ||
      message.includes("boa tarde") ||
      message.includes("boa noite") ||
      message.includes("tenho interesse") ||
      message.includes("mais informações") ||
      message.includes("informacoes")
    ) {
      reply =
        "Olá! 👋\n\n" +
        "Seja bem-vindo à *HSB Elétrica & Renováveis* ⚡☀️\n\n" +
        "Podemos te ajudar com:\n" +
        "1️⃣ Instalações elétricas\n" +
        "2️⃣ Energia solar\n" +
        "3️⃣ Solicitar orçamento\n" +
        "4️⃣ Falar com um técnico\n\n" +
        "👉 Responda com o número da opção.";
    }

    // ================================
    // ENVIO DA RESPOSTA VIA Z-API
    // ================================
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

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error.message);
    return res.sendStatus(200); // NUNCA retornar erro para a Z-API
  }
});

// ================================
// START SERVER
// ================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});

// ================================
// TRATAMENTO DE SIGTERM (Railway)
// ================================
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido. Encerrando com segurança.");
});
