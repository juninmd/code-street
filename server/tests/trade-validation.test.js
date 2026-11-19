const request = require('supertest');
const app = require('../index');
const db = require('../db');

const seedFeature = () => request(app).post('/api/features').send({ title: 'Trade Me', category: 'frontend' });

describe('Trade endpoints input validation', () => {
    beforeEach((done) => {
        db.serialize(() => {
            db.run('DELETE FROM pledges');
            db.run('DELETE FROM features', done);
        });
    });

    afterAll((done) => {
        db.close(done);
    });

    it('quantum-trade accepts a numeric string and responds without crashing', async () => {
        await seedFeature();
        const res = await request(app).post('/api/market/quantum-trade').send({ investment: '100' });
        expect(res.statusCode).toBe(200);
        expect(res.body.investment).toBe(100);
    });

    it('quantum-trade rejects non-numeric investment', async () => {
        await seedFeature();
        const res = await request(app).post('/api/market/quantum-trade').send({ investment: 'abc' });
        expect(res.statusCode).toBe(400);
    });

    it('etfs/buy rejects a non-numeric amount instead of writing NaN', async () => {
        const res = await request(app).post('/api/etfs/buy').send({ category: 'frontend', amount: 'abc' });
        expect(res.statusCode).toBe(400);
    });
});
