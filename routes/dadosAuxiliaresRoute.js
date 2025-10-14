const express = require('express');
const router = express.Router();
const dadosAuxiliares = require('../controllers/dadosAuxiliaresController');

router.get('/mobilidades', dadosAuxiliares.listarMobilidades);
router.get('/niveis-autonomia', dadosAuxiliares.listarNiveis);
router.get('/responsaveis', dadosAuxiliares.listarResponsaveis);

export default router;

