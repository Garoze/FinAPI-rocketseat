const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

const cpfAccountExists = (req, res, next) => {
   const { cpf } = req.headers;

   const customer = customers.find((customer) => customer.cpf == cpf);
   if (!customer) {
      return res.status(400).json({ error: 'customer not found'});
   }

   req.customer = customer;
   return next();
}

app.post('/account', (req, res) => {
  const { name, cpf } = req.body;

  const customerExists = customers.some((customer) => customer.cpf === cpf);
  if (customerExists) {
     return res.status(400).send({error: "Customer already exists!"});
  }

  customers.push({ id: uuidV4(), name, cpf, statement: [] });

  return res.status(201).send();
});

app.get('/statement/', cpfAccountExists, (req, res) => {
   const { customer } = req;
   return res.json(customer.statement);
});

app.post('/deposit', cpfAccountExists, (req, res) => {
   const { customer } = req; 
   const { description, amount } = req.body; 
   
   const operation = {
      description,
      amount,
      create_at: new Date(),
      type: "credit",
   }
   
   customer.statement.push(operation);

   return res.status(201).send();
});

app.listen('3000', () => console.log(`Server running on port: 3000!`));
