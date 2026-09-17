const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('POST /auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ name: 'Jane Doe', email: 'jane@example.com' });
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/auth/register').send({
      name: 'Jane Two',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });

  it('rejects a short password', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'jane@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user for a valid token', async () => {
    const register = await request(app).post('/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('jane@example.com');
  });
});
