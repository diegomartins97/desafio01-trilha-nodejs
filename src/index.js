const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  } else {
    req.user = user;
    return next();
  }
}

app.post('/users', (req, res) => {
    const { name, username } = req.body;
    
    if (!name || !username) {
        return res.status(400).json({ error: 'Missing name or username' });
    }

    const verifyUsersExists = users.find(user => user.username === username);

    if (verifyUsersExists) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    };

    users.push(user);
    return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;
    
  if (!title || !deadline) {
      return res.status(404).json({ error: 'Missing title or deadline' });
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  } 

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  } else {
    todo.done = true
    return res.json(todo);
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
 const { user } = req;
 const { id } = req.params;

 const todo = user.todos.find(todo => todo.id === id);

 if (!todo) {
   return res.status(404).json({ error: 'Todo not found' });
 } else {
   
    const index = user.todos.indexOf(todo);
    user.todos.splice(index, 1);

   return res.status(204).json();
 }
});

module.exports = app;