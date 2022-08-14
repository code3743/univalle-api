const {Router } = require('express');
const { getInformacionPrimariaOPAC, actualizarLibro, actualizarTodo } = require('../controllers/sistema_opac.controller');

const router = Router();

router.get('/', getInformacionPrimariaOPAC);
router.get('/actualizar/:index', actualizarLibro);
router.get('/actualizar',actualizarTodo)


module.exports = router;