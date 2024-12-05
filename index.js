const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
   res.send('Hello world');
});
app.get('/show', (req, res) => {
   res.send('show data here');
});

app.listen(port, () => {
   console.log(`server is running on http://localhost:${port}`);
});