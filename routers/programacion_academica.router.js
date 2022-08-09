const {Router } = require('express');
const { desplegarInformacion, consultarInformacion, getElectivas } = require('../controllers/programacion_academica.controller');

const router = Router();

router.get('/', desplegarInformacion);
router.get('/consultar', consultarInformacion);
router.get('/electivas', getElectivas);

module.exports = router;