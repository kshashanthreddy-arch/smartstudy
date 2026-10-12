import { Router } from 'express';
import Exam from '../models/Exam.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try { res.json(await Exam.find({ user: req.user.id }).sort({ examDate: 1 })); }
  catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try {
    const { title, examDate } = req.body;
    if (!title?.trim() || !examDate) return res.status(400).json({ message: 'Exam title and date are required.' });
    res.status(201).json(await Exam.create({
      user: req.user.id, title: title.trim(), examDate,
      subject: req.body.subject || '', notes: req.body.notes || ''
    }));
  } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ message: 'Exam deleted.' });
  } catch (err) { next(err); }
});
export default router;
