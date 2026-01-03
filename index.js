require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const text = req.body?.message?.text;
    const phone = req.body?.phone;

    if (!text || !phone) return res.sendStatus(200);

    const prompt = `
Você é o assistente virtual da HSB Elétrica & Renováveis.
Responda de forma profissional, clara e objetiva.
Se o cliente pedir orçamento, faça perguntas diretas.
Mensagem do cliente: "${text}"
`;

    const ai = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const reply = ai.data.choices[0].message.content;

    await axios.post(
      `${process.env.ZAPI_URL}/send-text`,
      {
        phone,
        message: reply
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ZAPI_TOKEN}`
        }
      }
    );

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('HSB bot rodando na porta', PORT);
});
