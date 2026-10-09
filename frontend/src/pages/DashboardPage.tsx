import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useBoard } from '../hooks/useBoard';
import { Board } from '../types';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { boards, loading, error, createBoard, fetchBoards } = useBoard();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch boards on load
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      setCreateError('Board name is required');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const newBoard = await createBoard(boardName, boardDescription || undefined);
      if (newBoard?._id) {
        setOpen(false);
        setBoardName('');
        setBoardDescription('');
        // Navigate to the new board
        navigate(`/board/${newBoard._id}`);
      }
    } catch (err) {
      setCreateError('Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Box>
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Welcome, {user?.username || 'User'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your tasks and projects
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Create Board
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography>Loading boards...</Typography>
        </Box>
      ) : boards.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No boards yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your first board to start managing tasks
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => setOpen(true)}
          >
            Create Board
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {boards.map((board: Board) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={board._id}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {board.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {board.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tasks: {board.taskCount || 0}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Typography variant="body2" color="text.secondary">
                    Created by: {board.createdBy.username}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Board Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Board</DialogTitle>
        <DialogContent dividers>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="normal"
            label="Board Name"
            fullWidth
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            variant="outlined"
            required
          />
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            value={boardDescription}
            onChange={(e) => setBoardDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateBoard} 
            disabled={isCreating || !boardName.trim()} 
            variant="contained" 
            color="primary"
          >
            {isCreating ? 'Creating...' : 'Create Board'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;
