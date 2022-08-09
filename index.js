require('dotenv').config();

const Servidor = require('./models/servidor');

const servidor = new Servidor();



servidor.listen();