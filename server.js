const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/api/search-charities', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`https://data.gov.au/data/api/3/action/datastore_search`, {
      params: {
        resource_id: 'eb1e6be4-5b13-4feb-b28e-388bf7c26f93',
        q: q
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});