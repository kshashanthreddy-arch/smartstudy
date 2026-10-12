import { Router } from 'express';
import Subject from '../models/Subject.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try { res.json(await Subject.find({ user: req.user.id }).sort({ createdAt: -1 })); }
  catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: 'Subject name is required.' });
    res.status(201).json(await Subject.create({ user: req.user.id, name, color: req.body.color || '#7c83fd' }));
  } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Subject.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) return res.status(404).json({ message: 'Subject not found.' });
    res.json({ message: 'Subject deleted.' });
  } catch (err) { next(err); }
});
export default router;
