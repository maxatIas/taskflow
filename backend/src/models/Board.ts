import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IBoard extends Document {
  name: string;
  description: string;
  createdBy: Types.ObjectId | IUser;
  members: Types.ObjectId[] | IUser[];
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    maxlength: [50, 'Board name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Add createdBy to members array before saving
BoardSchema.pre('save', function(next) {
  if (!this.members.includes(this.createdBy)) {
    this.members.push(this.createdBy);
  }
  next();
});

export default model<IBoard>('Board', BoardSchema);
