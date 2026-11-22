const request = require('supertest');
const app = require('../index');
const db = require('../db');

const get = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))));

describe('concurrent transactions on the shared connection', () => {
    beforeEach((done) => {
        db.serialize(() => {
            db.run('DELETE FROM pledges');
            db.run('DELETE FROM features', done);
        });
    });

    afterAll((done) => {
        db.close(done);
    });

    it('keeps every pledge when requests overlap', async () => {
        const id = (await request(app).post('/api/features').send({ title: 'Busy', category: 'frontend' })).body.data.id;
        const results = await Promise.all(
            [10, 20, 30, 40].map((amount) => request(app).post(`/api/features/${id}/pledge`).send({ amount }))
        );
        expect(results.map((r) => r.statusCode)).toEqual([200, 200, 200, 200]);
        expect((await get('SELECT pledged_amount FROM features WHERE id = ?', [id])).pledged_amount).toBe(100);
        expect((await get('SELECT COUNT(*) AS n FROM pledges WHERE feature_id = ?', [id])).n).toBe(4);
    });

    it('does not lose a plain write made while another request rolls back', async () => {
        const id = (await request(app).post('/api/features').send({ title: 'Busy', category: 'frontend' })).body.data.id;
        const [failed, created] = await Promise.all([
            request(app).post('/api/features/999999/pledge').send({ amount: 5 }),
            request(app).post('/api/features').send({ title: 'Survivor', category: 'frontend' }),
        ]);
        expect(failed.statusCode).toBe(404);
        expect(created.statusCode).toBe(200);
        expect(await get('SELECT id FROM features WHERE id = ?', [created.body.data.id])).toBeDefined();
        expect((await get('SELECT pledged_amount FROM features WHERE id = ?', [id])).pledged_amount).toBe(0);
    });
});
