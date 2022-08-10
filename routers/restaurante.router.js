const {Router } = require('express');
const { getMenuSemana, getInformacionTiquetes } = require('../controllers/restaurante.controller');

const router = Router();

router.get('/', getMenuSemana);
router.post('/', getInformacionTiquetes);



module.exports = router;