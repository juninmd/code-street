export const getPortfolio = () => {
  const stored = localStorage.getItem('my_portfolio');
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    // Migration: If array of numbers (legacy format), convert to objects
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'number') {
       const migrated = parsed.map(id => ({ id, shares: 1, avgPrice: 0, type: 'long' }));
       localStorage.setItem('my_portfolio', JSON.stringify(migrated));
       return migrated;
    }
    return Array.isArray(parsed) ? parsed.map(p => ({ ...p, type: p.type || 'long' })) : [];
  } catch (e) {
    console.error("Portfolio parse error", e);
    return [];
  }
};

export const addToPortfolio = (id, shares, price, type = 'long') => {
    const portfolio = getPortfolio();
    const index = portfolio.findIndex(p => p.id === parseInt(id) && (p.type || 'long') === type);

    const s = parseFloat(shares);
    const p = parseFloat(price);

    if (index >= 0) {
        // Update existing position with average cost basis
        const existing = portfolio[index];
        const oldTotal = existing.shares * existing.avgPrice;
        const newTotal = s * p;
        const totalShares = existing.shares + s;

        portfolio[index] = {
            ...existing,
            shares: totalShares,
            avgPrice: (oldTotal + newTotal) / totalShares
        };
    } else {
        // New position
        portfolio.push({
            id: parseInt(id),
            shares: s,
            avgPrice: p,
            type: type
        });
    }

    localStorage.setItem('my_portfolio', JSON.stringify(portfolio));
    return portfolio;
};

export const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};
