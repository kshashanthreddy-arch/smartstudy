import { Router } from 'express';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try { res.json(await Task.find({ user: req.user.id }).sort({ createdAt: -1 })); }
  catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ message: 'Task title is required.' });
    const task = await Task.create({
      user: req.user.id, title, subject: req.body.subject || '',
      dueDate: req.body.dueDate || null,
      priority: ['Low', 'Medium', 'High'].includes(req.body.priority) ? req.body.priority : 'Medium'
    });
    res.status(201).json(task);
  } catch (err) { next(err); }
});
router.patch('/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (typeof req.body.completed === 'boolean') updates.completed = req.body.completed;
    if (req.body.title?.trim()) updates.title = req.body.title.trim();
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) { next(err); }
});
export default router;
