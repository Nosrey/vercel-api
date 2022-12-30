// const express = require('express');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
// const morgan = require('morgan');
// const products = require('./routes/products.js');
// const categories = require('./routes/categories.js')

// require('./db.js');

// const server = express();

// server.name = 'API';

// server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
// server.use(bodyParser.json({ limit: '50mb' }));
// server.use(cookieParser());
// server.use(morgan('dev'));
// server.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//     next();
// });

// server.use('/products', products);
// server.use('/categories', categories);

// // Error catching endware.
// server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
//     const status = err.status || 500;
//     const message = err.message || err;
//     console.error(err);
//     res.status(status).send(message);
// });

// module.exports = server;

const express = require('express');
const app = express();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(`postgres://pywdkbxe:HB2qXYt_kwRdn_3O69o9vsN5FOIr6NZU@berry.db.elephantsql.com/pywdkbxe`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});

app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

module.exports = {
    // ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
    conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
    app: app,
};