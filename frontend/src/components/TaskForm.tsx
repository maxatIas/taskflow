import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Task, TaskPriority, TaskStatus, User } from '../types';
import { useBoard } from '../hooks/useBoard';
import { useAuth } from '../hooks/useAuth';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  boardId: string;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, task, boardId }) => {
  const { createTask, updateTask } = useBoard();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus,
    tags: [] as string[],
    assignedTo: [] as User[],
    dueDate: null as Date | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing task data
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        tags: task.tags || [],
        assignedTo: (task.assignedTo as User[]) || [],
        dueDate: task.dueDate ? new Date(task.dueDate) : null
      });
    } else {
      // Reset for new task
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        tags: [],
        assignedTo: [],
        dueDate: null
      });
    }
  }, [task, open]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (task?._id) {
        // Update existing task
        await updateTask(task._id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          tags: formData.tags,
          assignedTo: formData.assignedTo.map(u => u._id),
          dueDate: formData.dueDate
        });
      } else {
        // Create new task
        await createTask(boardId, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          tags: formData.tags,
          assignedTo: formData.assignedTo.map(u => u._id),
          dueDate: formData.dueDate
        });
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock users for demo (in a real app, you'd fetch these)
  const mockUsers: User[] = [
    { _id: '1', email: 'user1@example.com', username: 'User One', createdAt: '', updatedAt: '' },
    { _id: '2', email: 'user2@example.com', username: 'User Two', createdAt: '', updatedAt: '' },
    { _id: '3', email: 'user3@example.com', username: 'User Three', createdAt: '', updatedAt: '' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {task?._id ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          
          <DialogContent dividers sx={{ pt: 2 }}>
            {error && (
              <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              autoFocus
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              variant="outlined"
            />

            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
                  label="Priority"
                  variant="outlined"
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
                  label="Status"
                  variant="outlined"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Autocomplete
              multiple
              options={mockUsers}
              getOptionLabel={(user) => user.username}
              value={formData.assignedTo}
              onChange={(_, newValue) => handleChange('assignedTo', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option.username} 
                    key={option._id} 
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Assigned To"
                  placeholder="Select users"
                  margin="normal"
                />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.tags}
              onChange={(_, newValue) => handleChange('tags', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option} 
                    key={index} 
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Tags"
                  placeholder="Add tags"
                  margin="normal"
                />
              )}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(newValue) => handleChange('dueDate', newValue)}
                slotProps={{ textField: { margin: 'normal', fullWidth: true } }}
              />
            </LocalizationProvider>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.title.trim()} 
              variant="contained" 
              color="primary"
              type="submit"
            >
              {isSubmitting ? 'Saving...' : (task?._id ? 'Update Task' : 'Create Task')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TaskForm;
