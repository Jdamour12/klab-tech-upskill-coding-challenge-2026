const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const requireAuth = require('./middleware/auth');
const swaggerSpec = require('./swagger');

const app = express();

// CLIENT_ORIGIN may be a comma-separated list, so the deployed frontend and
// a local dev server can both reach the API without swapping env vars.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRouter);
app.use('/tasks', requireAuth, tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
