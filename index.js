require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// URL base da Z-API (autenticação pela URL, sem header Bearer)
const ZAPI_BASE = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}`;

app.post('/webhook', async (req, res) => {
  // ============ LOGS DE DEBUG (vão aparecer nos logs do Railway) ============
  console.log('=== WEBHOOK CHAMADO ===');
  console.log('Hora:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body completo:', JSON.stringify(req.body, null, 2));
  // =========================================================================

  try {
    const data = req.body;

    // Tenta vários formatos comuns que a Z-API pode enviar
    let phone = data.phone || data.from || data.remoteJid || data.key?.remoteJid;
    let text = 
      data.message?.text ||
      data.text?.message ||
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      data.text ||
      data.conversation;

    // Se ainda não achou texto, tenta caminho mais profundo
    if (!text && data.message) {
      text = data.message.conversation || data.message.extendedTextMessage?.text;
    }

    // Ignora se não tiver telefone ou texto
    if (!phone || !text) {
      console.log('Ignorando evento: sem phone ou sem texto');
      return res.sendStatus(200);
    }

    // Ignora mensagens enviadas pelo próprio bot (evita loop infinito)
    if (data.fromMe || data.isSentByMe || data.owner === true) {
      console.log('Ignorando mensagem enviada por mim mesmo');
      return res.sendStatus(200);
    }

    console.log(`Mensagem recebida de ${phone}: ${text}`);

    // Chamada para o GPT-5.2 (ou troque para gpt-4o-mini se quiser mais barato)
    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-5.2',
        messages: [
          {
            role: 'system',
            content: 'Você é o assistente virtual da HSB Elétrica & Renováveis. Responda de forma profissional, clara, objetiva e educada. Use todas as informações da empresa que conhece. Se o cliente pedir orçamento, faça perguntas diretas para qualificar o pedido (tipo de serviço, localização, urgência etc.).'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const reply = aiResponse.data.choices[0].message.content.trim();

    console.log(`Resposta do GPT-5.2: ${reply}`);

    // Envia resposta de volta pelo WhatsApp via Z-API
    await axios.post(`${ZAPI_BASE}/send-text`, {
      phone: phone,
      message: reply
    });

    console.log(`Resposta enviada com sucesso para ${phone}`);

    res.sendStatus(200);
  } catch (error) {
    console.error('ERRO no processamento:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    res.sendStatus(500);
  }
});

// Rota simples para testar se o servidor está vivo
app.get('/', (req, res) => {
  res.send('HSB WhatsApp Bot com GPT-5.2 está online! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('HSB Bot com GPT-5.2 rodando na porta', PORT);
});
