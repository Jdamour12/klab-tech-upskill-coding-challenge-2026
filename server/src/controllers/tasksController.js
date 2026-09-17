const pool = require('../db/pool');

const VALID_STATUSES = ['Pending', 'Completed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const MAX_LIMIT = 100;

function validateTaskInput(body, { partial = false } = {}) {
  const errors = [];
  const { title, description, status, priority } = body;

  if (!partial || title !== undefined) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('title is required and must be a non-empty string');
    } else if (title.trim().length > 200) {
      errors.push('title must be 200 characters or fewer');
    }
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string');
  }

  return errors;
}

async function getAllTasks(req, res, next) {
  try {
    const { status, search } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), MAX_LIMIT);
    const offset = (page - 1) * limit;

    const conditions = ['user_id = $1'];
    const params = [req.userId];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(`SELECT COUNT(*) FROM tasks ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.json({
      data: result.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const errors = validateTaskInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { title, description = '', status = 'Pending', priority = 'Medium' } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title.trim(), description, status, priority, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const errors = validateTaskInput(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const current = existing.rows[0];
    const {
      title = current.title,
      description = current.description,
      status = current.status,
      priority = current.priority,
    } = req.body;

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [title.trim(), description, status, priority, id, req.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
