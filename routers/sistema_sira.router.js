const { Router} = require('express');
const { getInformacionSIRA, getTabulado, getCalificaiones } = require('../controllers/sistema_sira.controller');


const router = Router();


router.post('/', getInformacionSIRA);
router.get('/tabulado',getTabulado);
router.get('/calificaiones', getCalificaiones)


module.exports = router;