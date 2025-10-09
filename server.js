const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors()); // 
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/todoapp')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['To Do', 'Doing', 'Done'], default: 'To Do' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tags: [String]
});
const Task = mongoose.model('Task', taskSchema);

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.get('/api/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.json(task);
});

app.post('/api/tasks', async (req, res) => {
  const newTask = new Task({
    title: req.body.title,
    status: req.body.status,
    tags: req.body.tags
  });
  const savedTask = await newTask.save();
  res.json(savedTask);
});


app.put('/api/tasks/:id', async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      status: req.body.status,
      tags: req.body.tags
    },
    { new: true }
  );
  res.json(updatedTask);
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted successfully' });
});


// --- Start Server ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

