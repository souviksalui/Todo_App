// In a separate file, e.g., 'userRoutes.js'
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Task list');
});

router.get('/:task_id', (req, res) => {
  res.send(`User ID: ${req.params.task_id}`);
});

module.exports = router;

// In your main application file (e.g., 'app.js')
const express = require('express');
const app = express();
const userRoutes = require('./userRoutes');

app.use('/users', userRoutes); // Mount the user routes at '/users'

app.listen(3000, () => {
  console.log('Server running on port 3000');
});