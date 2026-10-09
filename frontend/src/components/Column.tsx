import { useDroppable } from '@dnd-kit/core';
import { Box, Typography, Paper } from '@mui/material';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from '../types';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks, onEditTask }) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'column',
      id
    }
  });

  const columnColors = {
    'todo': '#f5f5f5',
    'in-progress': '#e3f2fd',
    'done': '#e8f5e9'
  };

  return (
    <Box 
      component={Paper}
      ref={setNodeRef}
      sx={{
        flex: 1,
        minWidth: 300,
        maxWidth: 400,
        p: 2,
        mr: 3,
        backgroundColor: columnColors[id] || '#ffffff',
        borderRadius: 2,
        minHeight: '100px'
      }}
    >
      <Typography 
        variant="h6" 
        component="div"
        sx={{
          mb: 2,
          fontWeight: 'bold',
          textAlign: 'center',
          textTransform: 'uppercase',
          color: 'text.secondary'
        }}
      >
        {title}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onEdit={onEditTask}
          />
        ))}
        
        {tasks.length === 0 && (
          <Box 
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.disabled'
            }}
          >
            <Typography variant="body2">No tasks</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Column;
