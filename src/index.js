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

const getBalance = (statement) => {
   const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'credit') {
         return acc + operation.amount;
      } else {
         return acc - operation.amount;
      }
   }, 0);

   return balance;
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

app.post('/withdraw', cpfAccountExists, (req, res) => {
   const { customer } = req;
   const { amount } = req.body;
   
   const customerBalance = getBalance(customer.statement);
   if (customerBalance < amount) {
      res.status(400).json({ error: 'insufficient funds'});
   }

   const operation = {
      amount,
      create_at: new Date(),
      type: 'debit'
   }

   customer.statement.push(operation);

   return res.status(201).send();
});

app.get('/statement/date', cpfAccountExists, (req, res) => {
   const { customer } = req;
   const { date } = req.query;
   
   const formatDate = new Date(date + " 00:00");

   const statements = customer.statement.filter((operation) => operation.create_at.toDateString() === new Date(formatDate).toDateString());
   
   return res.json(statements);
});

app.put('/account', cpfAccountExists, (req, res) => {
   const { name } = req.body;
   const { customer } = req;

   customer.name = name;
   return res.status(201).send();
});

app.get('/account', cpfAccountExists, (req, res) => {
   const { customer } = req;

   return res.json(customer);
});

app.delete('/account', cpfAccountExists, (req, res) => {
   const { customer } = req;

   customers.splice(customer, 1);

   return res.status(200).json(customers);
});

app.listen('3000', () => console.log(`Server running on port: 3000!`));
