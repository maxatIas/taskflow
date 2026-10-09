import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User';
import { IBoard } from './Board';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  tags: string[];
  boardId: Types.ObjectId | IBoard;
  assignedTo: Types.ObjectId[] | IUser[];
  createdBy: Types.ObjectId | IUser;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  tags: {
    type: [String],
    default: []
  },
  boardId: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export default model<ITask>('Task', TaskSchema);
