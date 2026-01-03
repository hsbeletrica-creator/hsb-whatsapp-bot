import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Railway usa PORT dinâmica
const PORT = process.env.PORT || 8080;

// ===============================
// ROTA DE SAÚDE (OBRIGATÓRIA)
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("HSB WhatsApp Bot ONLINE 🚀");
});

// ===============================
// WEBHOOK DA Z-API
// ===============================
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.message?.text;
    const phone = req.body?.phone;

    // Se não for mensagem válida, apenas confirma recebimento
    if (!message || !phone) {
      return res.sendStatus(200);
    }

    // ===============================
    // CHAMADA À OPENAI (ENDPOINT NOVO)
    // ===============================
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: `
Você é um assistente da empresa HSB Elétrica e Renováveis.
Responda de forma profissional, educada e objetiva.

Mensagem do cliente:
"${message}"
        `
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const resposta =
      aiResponse.data.output_text ||
      "Olá! Em que posso ajudar com serviços elétricos ou energia solar?";

    // ===============================
    // ENVIO DA RESPOSTA VIA Z-API
    // ===============================
    await axios.post(
      `${process.env.ZAPI_URL}/send-text`,
      {
        phone,
        message: resposta
      },
      {
        headers: {
          "Client-Token": process.env.zapi_token,
          "Content-Type": "application/json"
        }
      }
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error.response?.data || error.message);
    return res.sendStatus(200); // Nunca devolver erro para a Z-API
  }
});

// ===============================
// INICIALIZA O SERVIDOR
// ===============================
app.listen(PORT, () => {
  console.log(`HSB bot rodando na porta ${PORT}`);
});
