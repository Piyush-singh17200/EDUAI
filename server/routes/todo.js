import express from 'express';

const router = express.Router();

// In-memory storage for demo (replace with database in production)
const todos = {};

// Get all todos for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userTodos = todos[userId] || [];
    res.json({ success: true, data: userTodos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new todo
router.post('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description, category, priority = 'medium', dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!todos[userId]) {
      todos[userId] = [];
    }

    const newTodo = {
      id: Date.now(),
      title,
      description,
      category,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    todos[userId].push(newTodo);
    res.json({ success: true, data: newTodo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a todo
router.put('/:userId/:todoId', (req, res) => {
  try {
    const { userId, todoId } = req.params;
    const { title, description, category, priority, dueDate, completed } = req.body;

    if (!todos[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const todo = todos[userId].find(t => t.id === parseInt(todoId));
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (category !== undefined) todo.category = category;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (completed !== undefined) todo.completed = completed;
    todo.updatedAt = new Date();

    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a todo
router.delete('/:userId/:todoId', (req, res) => {
  try {
    const { userId, todoId } = req.params;

    if (!todos[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const index = todos[userId].findIndex(t => t.id === parseInt(todoId));
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const deleted = todos[userId].splice(index, 1)[0];
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get completed and pending stats
router.get('/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    const userTodos = todos[userId] || [];

    const stats = {
      total: userTodos.length,
      completed: userTodos.filter(t => t.completed).length,
      pending: userTodos.filter(t => !t.completed).length,
      byPriority: {
        high: userTodos.filter(t => t.priority === 'high').length,
        medium: userTodos.filter(t => t.priority === 'medium').length,
        low: userTodos.filter(t => t.priority === 'low').length
      },
      completionRate: userTodos.length > 0 
        ? Math.round((userTodos.filter(t => t.completed).length / userTodos.length) * 100) 
        : 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
