import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import initializeDatabase from './config/initDb';
import claimRoutes from './routes/claims';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Routes
app.use('/api/claims', claimRoutes);

// Initialize database before starting server
initializeDatabase()
  .then(result => {
    if (result.success) {
      console.log('Database initialization completed successfully');
    } else {
      console.warn('Database initialization failed, some features may not work properly');
      console.warn('Error:', result.error);
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    console.log('Starting server without database initialization...');
    
    // Start server anyway
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without database initialization)`);
    });
  });