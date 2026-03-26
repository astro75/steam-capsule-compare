const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Search for games by name
app.get('/api/search', async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'Missing search term' });

    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get app details
app.get('/api/appdetails/:appid', async (req, res) => {
  try {
    const { appid } = req.params;
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get "More Like This" similar games
app.get('/api/morelike/:appid', async (req, res) => {
  try {
    const { appid } = req.params;
    const url = `https://store.steampowered.com/recommended/morelike/app/${appid}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const similar = [];
    $('a.similar_grid_item, a.recommendation_link, a[data-ds-appid]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const dsAppid = $el.attr('data-ds-appid');
      let id = dsAppid;
      if (!id) {
        const match = href.match(/\/app\/(\d+)/);
        if (match) id = match[1];
      }
      if (id && !similar.find(s => s.appid === id)) {
        const name = $el.find('.similar_grid_capsule_name, .tab_item_name, .ellipsis').text().trim()
          || $el.text().trim().split('\n')[0].trim();
        similar.push({ appid: id, name: name || `App ${id}` });
      }
    });

    // Fallback: try to find any app links
    if (similar.length === 0) {
      $('a[href*="/app/"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const match = href.match(/\/app\/(\d+)/);
        if (match && !similar.find(s => s.appid === match[1])) {
          const name = $(el).text().trim().split('\n')[0].trim();
          similar.push({ appid: match[1], name: name || `App ${match[1]}` });
        }
      });
    }

    res.json({ similar: similar.slice(0, 12) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy Steam images to avoid CORS issues
app.get('/api/image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !url.includes('steamstatic.com') && !url.includes('steampowered.com')) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }
    const response = await fetch(url);
    const buffer = await response.buffer();
    res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Steam Capsule Compare running at http://localhost:${PORT}`);
});
