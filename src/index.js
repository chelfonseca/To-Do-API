const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if(!user){
    return response.status(404).json({
      error : "User not found!"
    })
  }

  request.user = user;
  return next();
}

function checksExistsUserToDo(request, response, next){
  const { user } = request;
  const toDoId = request.params.id;

  const toDoToUpdate = user.todos.find((todo) => todo.id === toDoId);
  
  if(!toDoToUpdate){
    return response.status(404).json({
      error:"To Do Not Found!"})
  };
  request.toDoToUpdate = toDoToUpdate;

  return next();
}
app.post('/users', (request, response) => {
  // Complete aqui
  const {name , username } = request.body;

  const isUserAlreadyExists = users.some((user) => user.username === username);

  if(isUserAlreadyExists){
    return response.status(400).json({
      error: "User already exists!"
    })
  }
  const user = {
    id: uuidv4(),
    name: name, 
    username: username,
    todos:[]
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
 
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { title, deadline } = request.body;
  
  const newToDo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newToDo);

  return response.status(201).json(newToDo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsUserToDo, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body;
  const { toDoToUpdate } = request;

  toDoToUpdate.title = title;
  toDoToUpdate.deadline = new Date(deadline);

  return response.json(toDoToUpdate);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsUserToDo, (request, response) => {
  // Complete aqui
  const { toDoToUpdate:toDoToMarkDone } = request;
 
  toDoToMarkDone.done = true;

  return response.json(toDoToMarkDone);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsUserToDo, (request, response) => {
  // Complete aqui
  const { user, toDoToUpdate: toDoToDelete } = request;

  user.todos.splice(toDoToDelete,1);
  
  return response.status(204).json();

});

module.exports = app;