const request = require('supertest');
const app = require('../index');
const db = require('../db');

describe('POST /api/features input validation', () => {
    beforeEach((done) => {
        db.serialize(() => {
            db.run('DELETE FROM pledges');
            db.run('DELETE FROM features', done);
        });
    });

    afterAll((done) => {
        db.close(done);
    });

    it('rejects a negative initial pledge instead of listing a feature in debt', async () => {
        const res = await request(app).post('/api/features').send({ title: 'Debt', initial_pledge: -500 });
        expect(res.statusCode).toBe(400);
        const rows = await new Promise((resolve) => db.all('SELECT * FROM pledges', (_, r) => resolve(r)));
        expect(rows).toEqual([]);
    });

    it('rejects a blank or non-text title', async () => {
        expect((await request(app).post('/api/features').send({ title: '   ' })).statusCode).toBe(400);
        expect((await request(app).post('/api/features').send({ title: 42 })).statusCode).toBe(400);
    });

    it('still accepts a feature without an initial pledge', async () => {
        const res = await request(app).post('/api/features').send({ title: 'Dark Mode' });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.ticker).toBe('DARK');
        expect(res.body.data.pledged_amount).toBe(0);
    });
});
