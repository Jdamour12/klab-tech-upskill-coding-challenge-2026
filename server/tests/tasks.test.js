const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');

let token;

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');
  const res = await request(app).post('/auth/register').send({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
  });
  token = res.body.token;
});

afterAll(async () => {
  await pool.end();
});

function auth(req) {
  return req.set('Authorization', `Bearer ${token}`);
}

describe('task CRUD', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });

  it('creates a task', async () => {
    const res = await auth(request(app).post('/tasks')).send({ title: 'Write tests' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Write tests', status: 'Pending', priority: 'Medium' });
  });

  it('rejects a task with no title', async () => {
    const res = await auth(request(app).post('/tasks')).send({ description: 'no title' });
    expect(res.status).toBe(400);
  });

  it('lists only the current user\'s tasks', async () => {
    await auth(request(app).post('/tasks')).send({ title: 'My task' });

    const otherUser = await request(app).post('/auth/register').send({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
    });
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${otherUser.body.token}`)
      .send({ title: "Other's task" });

    const res = await auth(request(app).get('/tasks'));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('My task');
  });

  it('updates a task', async () => {
    const created = await auth(request(app).post('/tasks')).send({ title: 'Original' });
    const res = await auth(request(app).put(`/tasks/${created.body.id}`)).send({
      title: 'Updated',
      status: 'Completed',
    });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.status).toBe('Completed');
  });

  it('only allows status updates after a task is completed', async () => {
    const created = await auth(request(app).post('/tasks')).send({
      title: 'Original',
      description: 'Original details',
      priority: 'High',
    });
    await auth(request(app).put(`/tasks/${created.body.id}`)).send({ status: 'Completed' });

    const forbidden = await auth(request(app).put(`/tasks/${created.body.id}`)).send({
      title: 'Changed',
      description: 'Changed details',
      priority: 'Low',
    });
    expect(forbidden.status).toBe(400);

    const allowed = await auth(request(app).put(`/tasks/${created.body.id}`)).send({ status: 'Pending' });
    expect(allowed.status).toBe(200);
    expect(allowed.body).toMatchObject({
      title: 'Original',
      description: 'Original details',
      priority: 'High',
      status: 'Pending',
    });
  });

  it('returns 404 when updating a task that does not exist', async () => {
    const res = await auth(request(app).put('/tasks/999')).send({ title: 'Nope' });
    expect(res.status).toBe(404);
  });

  it('deletes a task', async () => {
    const created = await auth(request(app).post('/tasks')).send({ title: 'Delete me' });
    const del = await auth(request(app).delete(`/tasks/${created.body.id}`));
    expect(del.status).toBe(204);

    const get = await auth(request(app).get(`/tasks/${created.body.id}`));
    expect(get.status).toBe(404);
  });

  it('filters by status', async () => {
    await auth(request(app).post('/tasks')).send({ title: 'Pending task' });
    const completed = await auth(request(app).post('/tasks')).send({ title: 'Done task' });
    await auth(request(app).put(`/tasks/${completed.body.id}`)).send({ status: 'Completed' });

    const res = await auth(request(app).get('/tasks?status=Completed'));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Done task');
  });

  it('searches by title and description', async () => {
    await auth(request(app).post('/tasks')).send({ title: 'Buy groceries', description: 'milk, eggs' });
    await auth(request(app).post('/tasks')).send({ title: 'Write report', description: 'quarterly numbers' });

    const res = await auth(request(app).get('/tasks?search=milk'));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Buy groceries');
  });

  it('paginates results', async () => {
    for (let i = 1; i <= 15; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await auth(request(app).post('/tasks')).send({ title: `Task ${i}` });
    }

    const page1 = await auth(request(app).get('/tasks?page=1&limit=10'));
    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.meta).toMatchObject({ total: 15, page: 1, limit: 10, totalPages: 2 });

    const page2 = await auth(request(app).get('/tasks?page=2&limit=10'));
    expect(page2.body.data).toHaveLength(5);
  });
});
