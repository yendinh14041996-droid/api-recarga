const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config()

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota de teste
app.get('/healthy', (req, res) => {
  return res.json({ name: "✅ API HEALTH IS OK" });
});

// Rota principal
app.post('/create-transaction', async (req, res) => {
  try {
    const {  email, phone, amount } = req.body;

  



    const url = process.env.URL;
    const publicKey = process.env.PUBLIC_KEY;
    const secretKey = process.env.SECRET_KEY;
    const auth = 'Basic ' + Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
    const phoneNumber= phone.replace(/\D/g, '');
   

    const newAmount = Number(amount) * 100;

    const response = await axios.post(url, {
      amount:newAmount,
      currency: 'BRL',
      paymentMethod: 'pix',
       pix: {expiresInDays: 1},
      customer: {
        name: "Bianca Josefa Rodrigues",
        email: email,
        document: { type: 'cpf', number: '81038638402' },
        phone:phoneNumber
      },
      items: [{
        title: 'Recarga',
        unitPrice: newAmount,
        quantity: 1,
        tangible: false
      }]
    }, {
      headers: {
        accept: 'application/json',
        authorization: auth,
        'content-type': 'application/json'
      }
    });
    console.log()

    const qrCode = response.data.pix.qrcode;
    const id = response.data.id;

    res.json({ id: id, qrcode: qrCode, success:true });

  } catch (error) {
    console.error('Erro na requisição:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro na requisição' });
  }
});

app.get('/transaction/:id', async (req, res) => {
  const id = req.params.id;
  const publicKey = process.env.PUBLIC_KEY;
  const secretKey = process.env.SECRET_KEY;
  const auth = 'Basic ' + Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
  try {
    const response = await axios.get(`${process.env.URL}/${id}`, {
      headers: {
        accept: 'application/json',
        authorization: auth
      }
    });

    const status = response.data.status; // ou response.status dependendo da API
    res.json({ status: status });

  } catch (error) {
    // console.error('Erro ao buscar transação:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
});

const port = 5002
app.listen(port, () => {
  console.log('server is running')
})
