const db = require('../db');

afterAll((done) => {
    db.close(done);
});

// Features default to workspace 1 (FK). The seed must be queued with the schema, not from a callback,
// or a request that arrives right after start-up fails with SQLITE_CONSTRAINT.
it('has the default workspace for the first statement queued after load', (done) => {
    db.get('SELECT COUNT(*) AS n FROM workspaces WHERE id = 1', (err, row) => {
        expect(err).toBeNull();
        expect(row.n).toBe(1);
        done();
    });
});
