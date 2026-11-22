import { adminFetch } from './adminFetch';

const response = (status) => ({ status, ok: status >= 200 && status < 300 });

describe('adminFetch', () => {
  beforeEach(() => {
    sessionStorage.clear();
    global.fetch = jest.fn();
    window.prompt = jest.fn();
  });

  it('sends the saved token as a bearer header', async () => {
    sessionStorage.setItem('code-street:admin-token', 'abc');
    fetch.mockResolvedValue(response(200));
    await adminFetch('/api/admin/payouts');
    expect(fetch).toHaveBeenCalledWith('/api/admin/payouts', { headers: { Authorization: 'Bearer abc' } });
    expect(window.prompt).not.toHaveBeenCalled();
  });

  it('asks for the token on 401, retries once and keeps it for the session', async () => {
    fetch.mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(200));
    window.prompt.mockReturnValue('novo-token');
    const res = await adminFetch('/api/admin/payout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenLastCalledWith('/api/admin/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer novo-token' },
    });
    expect(sessionStorage.getItem('code-street:admin-token')).toBe('novo-token');
  });

  it('returns the 401 untouched when the prompt is cancelled', async () => {
    fetch.mockResolvedValue(response(401));
    window.prompt.mockReturnValue(null);
    const res = await adminFetch('/api/admin/workspaces');
    expect(res.status).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('parallel 401s ask only once', async () => {
    fetch.mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(401)).mockResolvedValue(response(200));
    window.prompt.mockReturnValue('t');
    await Promise.all([adminFetch('/a'), adminFetch('/b')]);
    expect(window.prompt).toHaveBeenCalledTimes(1);
  });
});
