import { Schema, model } from 'mongoose';
import { USER_ROLES } from '../utils/enums.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'TESTER', required: true },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

export default model('User', userSchema);
