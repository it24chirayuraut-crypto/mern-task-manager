require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const Task = mongoose.model(
  'Task',
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      done: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

app.get('/', (req, res) => res.send('API running'));

app.get('/api/tasks', async (req, res) => {
  res.json(await Task.find().sort({ createdAt: -1 }));
});

app.post('/api/tasks', async (req, res) => {
  const task = await Task.create({ title: req.body.title });
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { done: req.body.done },
    { new: true }
  );
  res.json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('DB connection error:', err));