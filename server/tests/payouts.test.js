const request = require('supertest');
const app = require('../index');
const db = require('../db');

describe('Payout API Endpoints', () => {
  beforeEach((done) => {
    // Clean up tables
    db.serialize(() => {
        db.run("DELETE FROM payouts");
        db.run("DELETE FROM features", done);
    });
  });

  afterAll((done) => {
      // Just in case, though jest might complain about open handles if we don't close properly in the main app
      // But we are reusing the db instance from require('../db'), which is global.
      // We'll let Jest handle the teardown or use --forceExit if needed, but for now this is fine.
      // Actually, checking api.test.js, they call db.close(done).
      // However, since db.js exports a singleton that might be shared, closing it here might affect other tests if run in parallel.
      // But Jest runs files in parallel processes usually, so it should be fine.
      // Wait, sqlite3.Database object... if I close it here, and another test file imports db.js...
      // Jest uses separate workers. It should be fine.
      db.close(done);
  });

  describe('POST /api/admin/payout', () => {
    it('should create a payout record', async () => {
      const res = await request(app)
        .post('/api/admin/payout')
        .send({ amount: 500 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Payout processed');
      expect(res.body.data.amount).toBe(500);
    });

    it('should reject invalid amounts', async () => {
      const resZero = await request(app).post('/api/admin/payout').send({ amount: 0 });
      expect(resZero.statusCode).toEqual(400);

      const resNeg = await request(app).post('/api/admin/payout').send({ amount: -10 });
      expect(resNeg.statusCode).toEqual(400);

      const resString = await request(app).post('/api/admin/payout').send({ amount: 'abc' });
      expect(resString.statusCode).toEqual(400);
    });
  });

  describe('GET /api/admin/payouts', () => {
    it('should return list of payouts', async () => {
      await request(app).post('/api/admin/payout').send({ amount: 100 });
      await request(app).post('/api/admin/payout').send({ amount: 200 });

      const res = await request(app).get('/api/admin/payouts');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(2);
      // Ordered by DESC created_at usually, so 200 first
      expect(res.body.data[0].amount).toBe(200);
    });
  });

  describe('GET /api/stats (Withdrawal Logic)', () => {
      it('should reflect withdrawals in available balance', async () => {
          // 1. Setup Revenue
          await new Promise((resolve) => {
              db.serialize(() => {
                  // Revenue = 5% of pledged_amount
                  db.run("INSERT INTO features (title, pledged_amount, status) VALUES ('F1', 1000, 'active')", resolve);
              });
          });

          // Check Initial Stats (Revenue = 50, Withdrawn = 0, Balance = 50)
          const res1 = await request(app).get('/api/stats');
          expect(res1.body.platform_revenue).toBe(50);
          expect(res1.body.total_withdrawn).toBe(0);
          expect(res1.body.available_balance).toBe(50);

          // 2. Make Withdrawal
          await request(app).post('/api/admin/payout').send({ amount: 30 });

          // Check Updated Stats (Revenue = 50, Withdrawn = 30, Balance = 20)
          const res2 = await request(app).get('/api/stats');
          expect(res2.body.platform_revenue).toBe(50);
          expect(res2.body.total_withdrawn).toBe(30);
          expect(res2.body.available_balance).toBe(20);
      });
  });
});
