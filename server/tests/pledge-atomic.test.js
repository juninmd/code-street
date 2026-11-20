const request = require('supertest');
const app = require('../index');
const db = require('../db');

const run = (sql) => new Promise((resolve, reject) => db.run(sql, (err) => (err ? reject(err) : resolve())));

describe('POST /api/features/:id/pledge atomicity', () => {
    beforeEach((done) => {
        db.serialize(() => {
            db.run('DELETE FROM pledges');
            db.run('DELETE FROM features', done);
        });
    });

    afterAll((done) => {
        db.close(done);
    });

    it('leaves pledged_amount untouched when the pledge record cannot be written', async () => {
        const id = (await request(app).post('/api/features').send({ title: 'Atomic', category: 'frontend' })).body.data.id;
        await run('ALTER TABLE pledges RENAME TO pledges_offline');
        let res;
        try {
            res = await request(app).post(`/api/features/${id}/pledge`).send({ amount: 100 });
        } finally {
            await run('ALTER TABLE pledges_offline RENAME TO pledges');
        }
        expect(res.statusCode).toBe(400);
        const row = await new Promise((resolve) => db.get('SELECT pledged_amount FROM features WHERE id = ?', [id], (_, r) => resolve(r)));
        expect(row.pledged_amount).toBe(0);
    });

    it('still records a normal pledge', async () => {
        const id = (await request(app).post('/api/features').send({ title: 'Atomic', category: 'frontend' })).body.data.id;
        const res = await request(app).post(`/api/features/${id}/pledge`).send({ amount: 100 });
        expect(res.statusCode).toBe(200);
    });
});
