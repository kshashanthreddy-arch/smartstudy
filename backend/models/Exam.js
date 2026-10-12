import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, default: '' },
  examDate: { type: Date, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
