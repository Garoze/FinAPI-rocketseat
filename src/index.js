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

app.listen('3000', () => console.log(`Server running on port: 3000!`));
