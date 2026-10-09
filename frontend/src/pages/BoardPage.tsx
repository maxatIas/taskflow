import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  AvatarGroup,
  Avatar,
  Chip,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { useBoard, organizeTasksByStatus } from '../hooks/useBoard';
import { useAuth } from '../hooks/useAuth';
import Column from '../components/Column';
import TaskForm from '../components/TaskForm';
import { Task, Board, TaskStatus } from '../types';

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentBoard,
    tasks,
    columns,
    loading,
    error,
    fetchBoard,
    createTask,
    updateTaskStatus,
    deleteTask: deleteTaskFromBoard
  } = useBoard(id);

  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch board data
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchBoard(id).finally(() => setIsLoading(false));
    }
  }, [id, fetchBoard]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as TaskStatus;

    // Find the task
    const task = tasks.find(t => t._id === activeId);
    if (!task) return;

    // Update task status
    try {
      await updateTaskStatus(activeId, overId);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setOpenTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setOpenTaskForm(false);
    setEditingTask(null);
  };

  const handleAddTask = () => {
    if (!id) return;
    setEditingTask(null);
    setOpenTaskForm(true);
  };

  if (isLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading board...</Typography>
      </Box>
    );
  }

  if (error && !currentBoard) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!currentBoard) {
    return (
      <Box p={4}>
        <Typography variant="h6">Board not found</Typography>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Check if current user is the owner
  const isOwner = user?._id === (currentBoard.createdBy as any)?._id;

  // Get members excluding the owner for display
  const displayMembers = (currentBoard.members as any[]).filter(
    member => member._id !== currentBoard.createdBy._id
  );

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {currentBoard.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentBoard.description || 'No description'}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title="Add Task">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddTask}
            >
              Add Task
            </Button>
          </Tooltip>
          
          {isOwner && (
            <Tooltip title="Add Member">
              <IconButton color="primary">
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Board Options">
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Members */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Members:
        </Typography>
        <AvatarGroup max={5}>
          <Avatar 
            alt={(currentBoard.createdBy as any).username} 
            sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main' }}
          >
            {(currentBoard.createdBy as any).username.substring(0, 2).toUpperCase()}
          </Avatar>
          {displayMembers.map((member: any) => (
            <Avatar 
              key={member._id}
              alt={member.username}
              sx={{ width: 32, height: 32, fontSize: '0.8rem' }}
            >
              {member.username.substring(0, 2).toUpperCase()}
            </Avatar>
          ))}
        </AvatarGroup>
      </Box>

      {/* Kanban Board */}
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2
        }}
      >
        <DndContext 
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <Box 
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555'
              }
            }}
          >
            <Column
              id="todo"
              title="To Do"
              tasks={columns['todo'] || []}
              onEditTask={handleEditTask}
            />
            <Column
              id="in-progress"
              title="In Progress"
              tasks={columns['in-progress'] || []}
              onEditTask={handleEditTask}
            />
            <Column
              id="done"
              title="Done"
              tasks={columns['done'] || []}
              onEditTask={handleEditTask}
            />
          </Box>
        </DndContext>
      </Paper>

      {/* Task Form Modal */}
      {id && (
        <TaskForm
          open={openTaskForm}
          onClose={handleCloseTaskForm}
          task={editingTask}
          boardId={id}
        />
      )}
    </Box>
  );
};

export default BoardPage;
