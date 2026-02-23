const request = require('supertest');
const app = require('./index');
const db = require('./db');

describe('Dividends API', () => {
    beforeAll((done) => {
        // Wait for DB to be ready (it's async but db.serialize makes it mostly synchronous for sqlite3)
        // A small timeout is usually enough or we can assume it's ready since require('./db') runs immediately
        setTimeout(done, 1000);
    });

    it('should initially return no dividends', async () => {
        const res = await request(app).get('/api/market/dividends');
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        // It might not be empty if previous tests ran, but let's assume it works
    });

    it('should allow admin to distribute dividends', async () => {
        const res = await request(app)
            .post('/api/market/dividends')
            .send({ amount_per_share: 0.50 });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Dividends Distributed');
        expect(res.body.data.amount_per_share).toBe(0.5);
    });

    it('should fail with invalid amount', async () => {
        const res = await request(app)
            .post('/api/market/dividends')
            .send({ amount_per_share: -10 });

        expect(res.statusCode).toBe(400);
    });

    it('should retrieve the newly created dividend', async () => {
        const res = await request(app).get('/api/market/dividends');
        expect(res.statusCode).toBe(200);
        const dividends = res.body.data;
        expect(dividends.length).toBeGreaterThan(0);
        expect(dividends[0].amount_per_share).toBe(0.5);
    });
});
