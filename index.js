const bodyParse = require('body-parser');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require("morgan");
const verifyToken = require('./services/verify-token');

const app = express();
dotenv.config();

// Middleware để giải quyết CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());

app.use('/api/auth', require('./api/auth'));
app.use('/api/movies', require('./api/movies'));


// Middleware xác thực chỉ áp dụng cho các endpoint cần được bảo vệ
app.use(['/', '/api/users', '/api/danhmucs', '/api/nodemailer'], verifyToken);

app.get('/', (req, res) => {
    res.send('<h1>🤖 API SQLSERVER from NODEJS - TEST</h1>');
});


app.use('/api/users', require('./api/users'));
app.use('/api/tochucdvt', require('./api/tochucdvt'));

app.listen(process.env.PORT, () => {
    console.log(`Server started running on ${process.env.PORT} for ${process.env.NODE_ENV}`);
});
