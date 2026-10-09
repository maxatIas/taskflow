import { useState } from 'react';
import { Card, CardContent, Typography, Chip, Box, AvatarGroup, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Task, User } from '../types';
import { useBoard } from '../hooks/useBoard';
import { useAuth } from '../hooks/useAuth';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error'
};

const statusColors = {
  'todo': 'secondary',
  'in-progress': 'primary',
  'done': 'success'
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask } = useBoard();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!task._id) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(task._id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
      handleMenuClose();
    }
  };

  const isCurrentUserCreator = user?._id === (task.createdBy as User)?._id;
  const canEdit = isCurrentUserCreator || 
    (task.assignedTo as User[]).some(u => u._id === user?._id);

  return (
    <Card 
      sx={{
        mb: 2,
        boxShadow: 1,
        '&:hover': {
          boxShadow: 4,
          cursor: 'grab'
        }
      }}
      onClick={() => onEdit(task)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flexGrow={1}>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Chip 
                label={task.title} 
                size="small"
                color={priorityColors[task.priority] || 'default'}
              />
            </Typography>
            
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.description.length > 100 
                  ? `${task.description.substring(0, 100)}...` 
                  : task.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              {task.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          
          {canEdit && (
            <IconButton 
              aria-label="task-menu" 
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick(e);
              }}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box>
            <Chip 
              label={task.status.replace('-', ' ')}
              size="small"
              color={statusColors[task.status] || 'default'}
              variant="outlined"
            />
          </Box>
          
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
            {(task.assignedTo as User[]).map((user) => (
              <Avatar 
                key={user._id} 
                alt={user.username}
                src={``}
                sx={{ bgcolor: 'primary.main' }}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>

      {/* Menu for task actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => {
          onEdit(task);
          handleMenuClose();
        }}>
          Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDelete} 
          disabled={isDeleting}
          sx={{ color: 'error.main' }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskCard;
