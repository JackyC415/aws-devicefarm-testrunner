const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connectMongoDB = require("./config/initMongoDB");
const cors = require('cors');
const PORT = process.env.PORT || 3001;

//cross origin resources sharing
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());

//Allow Access Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

connectMongoDB();

app.use(require('./routes/testUpload'));

module.exports = app;
app.listen(PORT, () => console.log('Server listening on port:', PORT));