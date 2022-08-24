const {Router } = require('express');
const { desplegarInformacion, consultarInformacion, getElectivas, getInformacionIncial } = require('../controllers/programacion_academica.controller');

const router = Router();

router.get('/', getInformacionIncial);
router.get('/:sede/:facultad', desplegarInformacion);
router.get('/:sede/:facultad/:parametro', consultarInformacion);
router.get('/:sede', getElectivas);

module.exports = router;