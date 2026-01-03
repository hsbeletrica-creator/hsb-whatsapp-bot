import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Railway SEMPRE usa PORT dinâmica
const PORT = process.env.PORT;

// ==============================
// ROTA DE SAÚDE (OBRIGATÓRIA)
// ==============================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE");
});

// ==============================
// WEBHOOK Z-API
// ==============================
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.message?.text?.toLowerCase();
    const phone = req.body?.phone;

    if (!message || !phone) {
      return res.sendStatus(200);
    }

    let reply = "Obrigado pela mensagem! Em breve retornamos.";

    // 👇 AQUI ESTAVA O ERRO — AGORA CORRIGIDO
    if (message === "oi" || message === "olá" || message === "ola") {
      reply =
        "Olá! 👋\n\n" +
        "Bem-vindo à *HSB Elétrica & Renováveis* ⚡☀️\n\n" +
        "Como posso te ajudar?\n" +
        "1️⃣ Instalações elétricas\n" +
        "2️⃣ Energia solar\n" +
        "3️⃣ Orçamento\n" +
        "4️⃣ Falar com um técnico";
    }

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
  } catch (error) {
    console.error("Erro no webhook:", error.message);
    res.sendStatus(200); // NUNCA retornar erro pra Z-API
  }
});

// ==============================
// START SERVER
// ==============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});
