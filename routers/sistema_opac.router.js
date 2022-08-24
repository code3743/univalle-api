const {Router } = require('express');
const { getInformacionPrimariaOPAC, actualizarLibro, actualizarTodo, buscador, detalles } = require('../controllers/sistema_opac.controller');

const router = Router();

router.get('/', getInformacionPrimariaOPAC);
router.get('/actualizar/:index', actualizarLibro);
router.get('/actualizar',actualizarTodo)
router.get('/buscar', buscador);
router.get('/buscar/:id', detalles);

module.exports = router;