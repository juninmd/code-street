const util = require('util');

// One sqlite connection is shared by every request, so an open transaction would absorb (and roll back)
// statements from other requests. Every statement waits in one queue; a transaction holds it until it ends.
function createDbAccess(db) {
    const raw = {
        get: util.promisify(db.get).bind(db),
        all: util.promisify(db.all).bind(db),
        run: (sql, params = []) => new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        }),
    };

    let tail = Promise.resolve();
    const enqueue = (job) => {
        const result = tail.then(job);
        tail = result.catch(() => {});
        return result;
    };

    /** Runs `work(tx)` between BEGIN and COMMIT; any throw rolls back. Use only `tx` inside `work`. */
    const withTransaction = (work) => enqueue(async () => {
        await raw.run('BEGIN TRANSACTION');
        try {
            const value = await work(raw);
            await raw.run('COMMIT');
            return value;
        } catch (err) {
            await raw.run('ROLLBACK').catch((rollbackErr) => console.error('ROLLBACK failed', rollbackErr));
            throw err;
        }
    });

    return {
        dbGet: (sql, params) => enqueue(() => raw.get(sql, params)),
        dbAll: (sql, params) => enqueue(() => raw.all(sql, params)),
        dbRun: (sql, params) => enqueue(() => raw.run(sql, params)),
        withTransaction,
    };
}

module.exports = { createDbAccess };
