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



app.post('/dummy-transaction', async (req, res) => {

  try {
    console.log(req.body)

    res.json({
      id: 41378347,
      qrcode: "00020101021226870014br.gov.bcb.pix2565qrcode.santsbank.com/dynamic/980cb4be-2c32-48e7-aa66-e7559127ce435204000053039865802BR5910ZEXYY LTDA6009Sao Paulo62070503***6304BA6A",
      success: true
    })
  } catch (error) {
    console.error('Erro na requisição:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro na requisição' });
  }
})

app.get('/transaction-dummie/:id', async (req, res) => {

  try {
    const id = req.params.id;
    console.log(id)
    res.json({ status: 'paid' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
})
// Rota principal
app.post('/create-transaction', async (req, res) => {
  try {
    const { phone, amount } = req.body;

    // Listas de nomes e CPFs
    const nomes = [
      "Ana Silva Oliveira", "João Santos Pereira", "Maria Souza Lima", "Pedro Costa Rocha",
      "Paula Almeida Nunes", "Carlos Ferreira Mendes", "Juliana Rodrigues Carvalho",
      "Roberto Gomes Martins", "Fernanda Ribeiro Cardoso", "Lucas Araújo Vieira",
      "Patrícia Barbosa Moreira", "Marcos Rocha Teixeira", "Amanda Correia Neves",
      "Ricardo Dias Monteiro", "Camila Pinto Barros", "Bruno Cunha Farias",
      "Larissa Novaes Castro", "Thiago Mendonça Freitas", "Vanessa Peixoto Lopes",
      "Fábio Nascimento Aguiar", "Aline Guimarães Pires", "Rafael Macedo Viana",
      "Tatiana Santana Assis", "Diego Cardoso Brito", "Carolina Monteiro Cordeiro",
      "Eduardo Rezende Mattos", "Natália Fonseca Gusmão", "Gustavo Salgado Duarte",
      "Bianca Lacerda Prado", "Renato Vilarins Maia"
    ];
    const cpfs = [
      "15204548726", "17651890710", "16700952743", "18491883789", "20684056798",
      "16153401732", "20969094736", "16885757748", "19655569730", "18644956779",
      "19926878709", "19724862763", "18057076712", "20980956781", "20774868724",
      "19874544724", "13249415707", "19650436740", "16938998760", "17538103708",
      "17377172711", "19690773798", "06258928790", "09433009673", "18839162755",
      "15636730705", "18610912736", "17806159738", "20873334752", "20718023730"
    ];

    // Selecionar nome e CPF aleatórios
    const nomeAleatorio = nomes[Math.floor(Math.random() * nomes.length)];
    const cpfAleatorio = cpfs[Math.floor(Math.random() * cpfs.length)];



    const url = process.env.URL;
    const publicKey = process.env.PUBLIC_KEY;
    const secretKey = process.env.SECRET_KEY;
    const phoneNumber = phone.replace(/\D/g, '');

    const titulo = "Recarga de " + `${amount}`


    const newAmount = parseFloat(amount.replace(",", "."))

    

    const response = await axios.post(url, {
      amount: newAmount,
      currency: 'BRL',
      paymentMethod: 'pix',
      pix: { expiresInDays: 1 },
      customer: {
        name: nomeAleatorio,
        email: `${nomeAleatorio.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        document: { type: 'cpf', number: cpfAleatorio },
        phone: phoneNumber
      },
      items: [{
        title: titulo,
        unitPrice: newAmount,
        quantity: 1,
        tangible: false
      }]
    }, {
      headers: {
        'x-public-key': publicKey,
        'x-secret-key': secretKey,
        'Content-Type': 'application/json'
      }
    });
    console.log()

    const data = response.data;



    res.json({ data });

  } catch (error) {
    console.error('Erro na requisição:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro na requisição' });
  }
});

app.get('/transaction/:id', async (req, res) => {
  const id = req.params.id;
  const publicKey = process.env.PUBLIC_KEY;
  const secretKey = process.env.SECRET_KEY;

  try {
    const response = await axios.get(`https://dcnmsoaogkbgkbwpldrp.supabase.co/functions/v1/pix-receive?transaction_id=${id}`, {
      headers: {
        'x-public-key': publicKey,
        'x-secret-key': secretKey,
        'Content-Type': 'application/json'
      }
    });

    const status = response.data.transaction.status; // ou response.status dependendo da API
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
