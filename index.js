const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const port = 3001

// Syncing all the models at once.
conn.sync({ force: false }).then(() => {
    server.listen(port, '0.0.0.0', () => {
      console.log('Server listening on port ' + port); // eslint-disable-line no-console
    });
  });