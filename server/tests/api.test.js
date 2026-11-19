const request = require('supertest');
const app = require('../index');
const db = require('../db');

describe('API Endpoints', () => {
  beforeEach((done) => {
    // Clean up tables
    db.serialize(() => {
        db.run("DELETE FROM comments");
        db.run("DELETE FROM features", done);
    });
  });

  afterAll((done) => {
      db.close(done);
  });

  describe('GET /api/features', () => {
    it('should return empty list initially', async () => {
      const res = await request(app).get('/api/features');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return features filtered by category', async () => {
      await new Promise((resolve) => {
          db.serialize(() => {
              db.run("INSERT INTO features (title, category) VALUES ('F1', 'frontend')");
              db.run("INSERT INTO features (title, category) VALUES ('F2', 'backend')", resolve);
          });
      });

      const res = await request(app).get('/api/features?category=frontend');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('F1');
    });
  });

  describe('POST /api/features', () => {
      it('should create a feature', async () => {
          const res = await request(app).post('/api/features').send({
              title: 'New Feature',
              description: 'Awesome',
              category: 'frontend',
              initial_pledge: 50
          });
          expect(res.statusCode).toEqual(200);
          expect(res.body.data.title).toBe('New Feature');
          expect(res.body.data.pledged_amount).toBe(50);
      });

      it('should fail without title', async () => {
           const res = await request(app).post('/api/features').send({
              description: 'Awesome'
          });
          expect(res.statusCode).toEqual(400);
      });
  });

  describe('GET /api/stats', () => {
      it('should return correct stats', async () => {
          await new Promise((resolve) => {
              db.serialize(() => {
                db.run("INSERT INTO features (title, category, pledged_amount, status) VALUES ('F1', 'frontend', 100, 'live')");
                db.run("INSERT INTO features (title, category, pledged_amount, status) VALUES ('F2', 'backend', 50, 'under_review')");
                db.run("INSERT INTO features (title, category, pledged_amount, status) VALUES ('F3', 'frontend', 200, 'under_review')", resolve);
              });
          });

          const res = await request(app).get('/api/stats');
          expect(res.statusCode).toEqual(200);
          expect(res.body.total_payout).toBe(100); // Only live
          expect(res.body.active_bounty).toBe(250); // 50 + 200
          expect(res.body.top_category).toBe('frontend'); // 300 total
          expect(res.body.platform_revenue).toBe(350 * 0.05);
      });
  });

  describe('POST /api/features/:id/vote', () => {
      it('should increment votes', async () => {
          let id;
          await new Promise((resolve) => {
              db.run("INSERT INTO features (title) VALUES ('Vote Me')", function() {
                  id = this.lastID;
                  resolve();
              });
          });

          const res = await request(app).post(`/api/features/${id}/vote`);
          expect(res.statusCode).toEqual(200);

          const check = await request(app).get('/api/features');
          expect(check.body.data[0].votes).toBe(1);
      });
  });

  describe('POST /api/features/:id/boost', () => {
      it('should boost feature', async () => {
          let id;
          await new Promise((resolve) => {
              db.run("INSERT INTO features (title) VALUES ('Boost Me')", function() {
                  id = this.lastID;
                  resolve();
              });
          });

          const res = await request(app).post(`/api/features/${id}/boost`);
          expect(res.statusCode).toEqual(200);

          const check = await request(app).get('/api/features');
          expect(check.body.data[0].is_boosted).toBe(1);
      });
  });

  describe('POST /api/features/:id/pledge', () => {
      it('should add pledge', async () => {
          let id;
          await new Promise((resolve) => {
              db.run("INSERT INTO features (title, pledged_amount) VALUES ('Pledge Me', 10)", function() {
                  id = this.lastID;
                  resolve();
              });
          });

          const res = await request(app).post(`/api/features/${id}/pledge`).send({ amount: 20 });
          expect(res.statusCode).toEqual(200);

          const check = await request(app).get('/api/features');
          expect(check.body.data[0].pledged_amount).toBe(30);
      });
  });

  describe('Pledge/short/ETF validation', () => {
      const count = () => new Promise((resolve, reject) =>
          db.get('SELECT COUNT(*) AS n FROM pledges', (e, r) => (e ? reject(e) : resolve(r.n))));

      it('returns 404 and records no pledge for an unknown feature', async () => {
          const before = await count();
          const res = await request(app).post('/api/features/999999/pledge').send({ amount: 5 });
          expect(res.statusCode).toEqual(404);
          expect(await count()).toBe(before);
      });

      it.each(['abc', 'Infinity', -3, 0, true])('rejects non-positive/non-numeric amount %p', async (amount) => {
          const pledge = await request(app).post('/api/features/1/pledge').send({ amount });
          expect(pledge.statusCode).toEqual(400);
          const short = await request(app).post('/api/features/1/short').send({ amount });
          expect(short.statusCode).toEqual(400);
          const etf = await request(app).post('/api/etfs/buy').send({ category: 'frontend', amount });
          expect(etf.statusCode).toEqual(400);
      });
  });

  describe('Comments API', () => {
      it('should add and retrieve comments', async () => {
          let id;
          await new Promise((resolve) => {
              db.run("INSERT INTO features (title) VALUES ('Comment Me')", function() {
                  id = this.lastID;
                  resolve();
              });
          });

          await request(app).post(`/api/features/${id}/comments`).send({ content: 'First!' });
          await request(app).post(`/api/features/${id}/comments`).send({ content: 'Second!' });

          const res = await request(app).get(`/api/features/${id}/comments`);
          expect(res.statusCode).toEqual(200);
          expect(res.body.data.length).toBe(2);
          expect(res.body.data[0].content).toBe('First!');
      });
  });
});
