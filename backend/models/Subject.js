import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#7c83fd' }
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);
