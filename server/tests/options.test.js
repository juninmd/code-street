const request = require('supertest');
const app = require('../index');
const db = require('../db');

const seedFeature = async () => (await request(app).post('/api/features').send({ title: 'Opt Me', category: 'frontend' })).body.data.id;
const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString();
const buy = (body) => request(app).post('/api/options/buy').send(body);

describe('Options contracts', () => {
    beforeEach((done) => {
        db.serialize(() => {
            db.run('DELETE FROM options_contracts');
            db.run('DELETE FROM features', done);
        });
    });

    afterAll((done) => {
        db.close(done);
    });

    it('refuses to exercise a contract after its expiration date', async () => {
        const id = await seedFeature();
        const { lastID } = await new Promise((resolve, reject) => db.run(
            "INSERT INTO options_contracts (feature_id, type, strike_price, expiration_date, premium_paid) VALUES (?, 'put', 100, ?, 1)",
            [id, inDays(-1)],
            function (err) { return err ? reject(err) : resolve(this); },
        ));
        const res = await request(app).post(`/api/options/exercise/${lastID}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/expired/i);
    });

    it('rejects an unknown type, non-numeric prices and a past or invalid expiration', async () => {
        const id = await seedFeature();
        const ok = { feature_id: id, type: 'call', strike_price: 2, expiration_date: inDays(30), premium_paid: 0.5 };
        expect((await buy({ ...ok, type: 'straddle' })).statusCode).toBe(400);
        expect((await buy({ ...ok, strike_price: 'abc' })).statusCode).toBe(400);
        expect((await buy({ ...ok, premium_paid: -1 })).statusCode).toBe(400);
        expect((await buy({ ...ok, expiration_date: 'soon' })).statusCode).toBe(400);
        expect((await buy({ ...ok, expiration_date: inDays(-1) })).statusCode).toBe(400);
        expect((await buy(ok)).statusCode).toBe(200);
    });

    it('answers 404 for an option on a feature that does not exist', async () => {
        const res = await buy({ feature_id: 999999, type: 'put', strike_price: 2, expiration_date: inDays(30), premium_paid: 0.5 });
        expect(res.statusCode).toBe(404);
    });
});
