const express = require('express');
const fs = require('fs');
const YAML = require('yaml');
const app = express();
const cors = require('cors');
app.use(cors());

const scrapbookDB = './scrapbook.yaml';

app.get('/api/scrapbook', (req, res) => {
  const scrapbook = YAML.parse(fs.readFileSync(scrapbookDB, 'utf8'));
  res.json(Object.values(scrapbook));
});

app.listen(5000, () => console.log('Server running on port 5000'));
