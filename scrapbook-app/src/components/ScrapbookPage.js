import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardMedia } from '@mui/material';

const ScrapbookPage = () => {
  const [scrapbookEntries, setScrapbookEntries] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/scrapbook')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        setScrapbookEntries(data);
      })
      .catch(error => {
        console.error('Error fetching scrapbook entries:', error);
      });
  }, []);


return (
  <Container>
    <Typography variant="h2" gutterBottom>Scrapbook Entries</Typography>
    {scrapbookEntries.length > 0 ? (
      scrapbookEntries.map((entry, index) => (
        <Card key={index} sx={{ marginBottom: '20px' }}>
          <CardMedia
            component="img"
            height="140"
            image={entry.imageUrl}
            alt={entry.description}
          />
          <CardContent>
            <Typography variant="h5">{entry.description}</Typography>
            <Typography variant="body2">GitHub: <a href={entry.githubUrl}>{entry.githubUrl}</a></Typography>
            <Typography variant="body2">Sessions: {entry.sessions.join(', ')}</Typography>
          </CardContent>
        </Card>
      ))
    ) : (
      <Typography variant="body2">No scrapbook entries found.</Typography>
    )}
  </Container>
  );
};

export default ScrapbookPage;
