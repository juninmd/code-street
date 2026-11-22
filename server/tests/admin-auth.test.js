const request = require('supertest');
const app = require('../index');
const db = require('../db');

const ADMIN_ROUTES = [
  ['get', '/api/admin/workspaces'],
  ['post', '/api/admin/workspaces'],
  ['put', '/api/admin/workspaces/1/plan'],
  ['post', '/api/market/crash'],
  ['get', '/api/admin/payouts'],
  ['post', '/api/admin/payout'],
  ['post', '/api/market/dividends'],
  ['patch', '/api/features/1/status'],
];

describe('admin routes require ADMIN_TOKEN', () => {
  const saved = process.env.ADMIN_TOKEN;
  afterEach(() => {
    process.env.ADMIN_TOKEN = saved;
  });
  afterAll((done) => {
    db.close(done);
  });

  it.each(ADMIN_ROUTES)('%s %s without ADMIN_TOKEN configured -> 503 (fail closed)', async (method, url) => {
    delete process.env.ADMIN_TOKEN;
    const res = await request(app)[method](url).set('Authorization', 'Bearer anything').send({});
    expect(res.statusCode).toBe(503);
  });

  it.each(ADMIN_ROUTES)('%s %s without or with a wrong token -> 401', async (method, url) => {
    process.env.ADMIN_TOKEN = 'right-token';
    expect((await request(app)[method](url).send({})).statusCode).toBe(401);
    const wrong = await request(app)[method](url).set('Authorization', 'Bearer wrong-token').send({});
    expect(wrong.statusCode).toBe(401);
  });

  it('accepts the right token', async () => {
    process.env.ADMIN_TOKEN = 'right-token';
    const res = await request(app).get('/api/admin/workspaces').set('Authorization', 'Bearer right-token');
    expect(res.statusCode).toBe(200);
  });

  it('keeps public routes public', async () => {
    delete process.env.ADMIN_TOKEN;
    expect((await request(app).get('/api/market/dividends')).statusCode).toBe(200);
  });
});
