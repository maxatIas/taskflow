import { Schema, model, Document, Types } from 'mongoose';

export interface IBoard extends Document {
  name: string;
  description: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
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
  // Use string comparison and ignore TypeScript type issues
  // @ts-ignore
  const hasCreatedByInMembers = this.members.some(m => m.toString() === this.createdBy.toString());
  
  if (!hasCreatedByInMembers) {
    // @ts-ignore
    this.members.push(this.createdBy);
  }
  next();
});

export default model<IBoard>('Board', BoardSchema);
