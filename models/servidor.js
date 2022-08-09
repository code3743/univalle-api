
const express = require('express');
const cors = require('cors');

class Servidor{

    constructor(){
        this.app = express();
        this.port  = process.env.PORT;

        this.rutaSistemaSIRA = '/api/sira';
        this.rutaRestaurante = '/api/restaurante';
        this.rutaSistemaOPAC = '/api/opac';
        this.rutaProgramacionAcademica = '/api/programacion';
       
        this.middelwares();

        this.routes();

    }
    middelwares(){
       this.app.use(express.static('public'));
       this.app.use(express.json());
       this.app.use(cors());
    }

    routes(){
        this.app.use(this.rutaSistemaSIRA,require('../routers/sistema_sira.router'));
        this.app.use(this.rutaRestaurante, require('../routers/restaurante.router'));
        this.app.use(this.rutaSistemaOPAC, require('../routers/sistema_opac.router'));
        this.app.use(this.rutaProgramacionAcademica, require('../routers/programacion_academica.router'));
    }


    listen(){
        this.app.listen(this.port,()=>{console.log('Corriendo en el puerto:',this.port)});
    }


}

module.exports = Servidor;