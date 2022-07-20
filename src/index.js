const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

app.post('/account', (req, res) => {
  const { name, cpf } = req.body;

  const customerExists = customers.some((customer) => customer.cpf === cpf);
  if (customerExists) {
     return res.status(400).send({error: "Customer already exists!"});
  }

  customers.push({ id: uuidV4(), name, cpf, statement: [] });

  return res.status(201).send();
});

app.get('/statement/:cpf', (req, res) => {
   const { cpf } = req.params;

   const customer = customers.find((customer) => customer.cpf == cpf);
   if (!customer) {
      return res.status(400).json({ error: 'customer not found'});
   }

   return res.json(customer.statement);
});

app.listen('3000', () => console.log(`Server running on port: 3000!`));
