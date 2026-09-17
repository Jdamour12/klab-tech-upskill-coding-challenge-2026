const taskSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    title: { type: 'string', example: 'Write README' },
    description: { type: 'string', example: 'Document setup steps' },
    status: { type: 'string', enum: ['Pending', 'Completed'], example: 'Pending' },
    priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'Medium' },
    user_id: { type: 'integer', example: 1 },
    created_at: { type: 'string', format: 'date-time' },
  },
};

const taskInput = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['Pending', 'Completed'] },
    priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
  },
};

const errorResponse = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    errors: { type: 'array', items: { type: 'string' } },
  },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Taskly API',
    version: '1.0.0',
    description: 'REST API for Taskly, a task manager built for the kLab Tech Upskill Program coding challenge.',
  },
  servers: [{ url: '/', description: 'Current server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: { Task: taskSchema, TaskInput: taskInput, Error: errorResponse },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Create a new user account',
        security: [],
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created, returns a JWT and the user' },
          400: { description: 'Validation error', content: { 'application/json': { schema: errorResponse } } },
          409: { description: 'Email already registered', content: { 'application/json': { schema: errorResponse } } },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in with email and password',
        security: [],
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Returns a JWT and the user' },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: errorResponse } } },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get the currently authenticated user',
        tags: ['Auth'],
        responses: {
          200: { description: 'The current user' },
          401: { description: 'Missing or invalid token', content: { 'application/json': { schema: errorResponse } } },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'List the current user\'s tasks',
        tags: ['Tasks'],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Pending', 'Completed'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Matches against title or description' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated list of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: taskSchema },
                    meta: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a task',
        tags: ['Tasks'],
        requestBody: { required: true, content: { 'application/json': { schema: taskInput } } },
        responses: {
          201: { description: 'Created task', content: { 'application/json': { schema: taskSchema } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: errorResponse } } },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get a task by id',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'The task', content: { 'application/json': { schema: taskSchema } } },
          404: { description: 'Not found', content: { 'application/json': { schema: errorResponse } } },
        },
      },
      put: {
        summary: 'Update a task',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: taskInput } } },
        responses: {
          200: { description: 'Updated task', content: { 'application/json': { schema: taskSchema } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: errorResponse } } },
          404: { description: 'Not found', content: { 'application/json': { schema: errorResponse } } },
        },
      },
      delete: {
        summary: 'Delete a task',
        tags: ['Tasks'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Deleted' },
          404: { description: 'Not found', content: { 'application/json': { schema: errorResponse } } },
        },
      },
    },
  },
};
