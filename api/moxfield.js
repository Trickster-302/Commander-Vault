export default async function handler(req, res) {
  const { id, site } = req.query;
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid deck ID' });
  }

  const headers = {
    'User-Agent': 'CommanderVaultApp/1.0 (+https://vercel.app)',
    'Accept': 'application/json'
  };

  try {
    if (site === 'archidekt') {
      const archRes = await fetch(`https://archidekt.com/api/decks/${id}/`, { headers });
      if (!archRes.ok) {
        return res.status(archRes.status).json({ error: 'Archidekt fetch failed' });
      }
      const data = await archRes.json();
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(data);
    }

    let response = await fetch(`https://api2.moxfield.com/v3/decks/all/${id}`, { headers });
    if (!response.ok) {
      response = await fetch(`https://api2.moxfield.com/v2/decks/all/${id}`, { headers });
    }
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Moxfield fetch failed' });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy request error' });
  }
}
