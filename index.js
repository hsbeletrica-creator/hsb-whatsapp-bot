require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// URL base da Z-API
const ZAPI_BASE = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}`;

app.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook recebido:', JSON.stringify(req.body, null, 2));

    const event = req.body;

    // Filtra só mensagens recebidas de texto
    if (event.type !== 'ReceivedCallback' && event.event !== 'message.received') {
      return res.sendStatus(200);
    }

    const text = event.text?.message || event.message?.text || event.text;
    const phone = event.phone || event.from;

    if (!text || !phone) {
      return res.sendStatus(200);
    }

    // Evita loop (ignora mensagens enviadas pelo bot)
    if (event.isSentByMe || event.fromMe) {
      return res.sendStatus(200);
    }

    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-5.2',  // ← Aqui o modelo novo! (ou 'gpt-5.2-thinking' se quiser forçar modo reasoning)
        messages: [
          {
            role: 'system',
            content: 'Você é o assistente virtual da HSB Elétrica & Renováveis. Responda de forma profissional, clara, objetiva e educada. Use todas as informações da empresa que conhece. Se o cliente pedir orçamento, faça perguntas diretas para qualificar o pedido (ex: tipo de serviço, localização, urgência).'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 500  // Ajuste se quiser respostas mais longas
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = aiResponse.data.choices[0].message.content.trim();

    await axios.post(
      `${ZAPI_BASE}/send-text`,
      {
        phone: phone,
        message: reply
      }
    );

    console.log(`Resposta enviada para ${phone}: ${reply}`);
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('HSB Bot com GPT-5.2 rodando na porta', PORT);
});
