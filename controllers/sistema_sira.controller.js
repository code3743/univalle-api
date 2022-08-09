const fs = require('fs').promises

const {request, response} = require('express');
const { chromium } = require("playwright-chromium");


const obtenerInformacion = () => {
    const bloqueInformacionPersonal = document.querySelector('table>tbody>tr>td>table>tbody>tr>td>font').innerText.split('\n');
    const bloquesIndividuales = new Array(bloqueInformacionPersonal.length);
    for(let i= 0; i<bloqueInformacionPersonal.length; i++){
        const informacion = bloqueInformacionPersonal[i].split(': ')
        bloquesIndividuales[i] = informacion[1]
    }
    const estudiante = bloquesIndividuales[0].split(' -- ');
    const documento = bloquesIndividuales[1].split(' ');
    const programa = bloquesIndividuales[2].split('-');

    return {
        codigo: estudiante[0],
        nombre: estudiante[1],
        documento: {
            tipo: documento[0],
            numero: documento[1]
            },
        programa:{
            codigo: programa[0],
            nombre: programa[3],
            jornada: programa[2]
            },
        sede: programa[1],
        correo: bloquesIndividuales[3]
        }
};

const obtenerCalificaciones = ()=>{
    const coleccionTablas = document.querySelectorAll('.tituloIndex>table>tbody>tr>td>table[width="95%"]>tbody')[1].querySelectorAll('tr>td>table[cellspacing="1"]')
    const todasLasCalificaciones = new Array(coleccionTablas.length);
    const recorrerTabla = (tabla)=>{
      const tablaGeneral = tabla
      const tablaPromedios = tablaGeneral.querySelector('table>tbody>tr>td>table').querySelector('tbody').querySelectorAll('tr>td');
      const calificacion = new Array(11);
      const promedio = new Array(6);
      const periodo = tablaGeneral.querySelectorAll('tbody>tr')[0].querySelectorAll('td')[0].innerText;
      const fechaMatricula = tablaGeneral.querySelectorAll('tbody>tr')[1].querySelectorAll('td')[1].innerText;
      let index;
      for (let i = 0; i < tablaGeneral.querySelectorAll('tbody>tr').length; i++) {
        for (let j = 0; j < tablaGeneral.querySelectorAll('tbody>tr')[i].querySelectorAll('td').length; j++) {
            if(tablaGeneral.querySelectorAll('tbody>tr')[i].querySelectorAll('td')[j].innerText == 'CÓDIGO'){
                index = i + 1;
                break;
            }
        }
      }
      const tablaCalificaciones = new Array(tablaGeneral.querySelectorAll('tbody>tr').length - (4 + index));
      
      let aux = 0
      for(let i=2; i<tablaPromedios.length; i+=2){
        promedio[aux] = tablaPromedios[i].innerText
        aux++; 
      }
  
      for (let i=0; i<tablaCalificaciones.length; i++){
        for(let j=0; j<11; j++){
            calificacion[j] = tablaGeneral.querySelectorAll('tbody>tr')[i + index].querySelectorAll('td')[j].innerText;
        }
        const [codigoC, grupoC, asignaturaC, ,calificacionC, habilitacionC, , ,creditosC, canceladaC  ]= calificacion
         tablaCalificaciones[i] = {
          codigo: codigoC,
          grupo: grupoC,
          asignatura: asignaturaC,
          calificacion: calificacionC,
          habilitacion: habilitacionC,
          creditos: creditosC,
          cancelada: canceladaC
         };
      }
      return {
          periodo: periodo,
          fecha: fechaMatricula,
          calificaciones: tablaCalificaciones,
          resumen:{
            creditosMatriculados:promedio[0],
            creditosAprobados: promedio[1],
            porcentajeCredAprovados: promedio[2],
            creditoAcumulados: promedio[3],
            creditosAprobadosAcumulados: promedio[4],
            promedioSemestral:promedio[5]
          }
      }
    }
  
    for(let i= 0; i < coleccionTablas.length; i++){
      todasLasCalificaciones[i] = recorrerTabla(coleccionTablas[i]);
    }
    return {
      todosLosPeriodos: todasLasCalificaciones
    }
};

const getInformacionSIRA = async (req = request, res = response)=>{
    const {codigo, clave} = req.body;
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const context = await navegador.newContext();
        const page = await context.newPage();
        await page.goto("https://sira.univalle.edu.co/sra/");
        await page.fill('input[name="usu_login_aut"]',codigo);
        await page.fill('input[name="usu_password_aut"]',clave);
        await page.click('input[name="boton"]');
        await page.waitForLoadState();
        const validarUsuario = await page.$('table[name="tablaEncabezado"]');
        if(validarUsuario == null) return res.json({
            estatus: false,
            informacion:[],
            value: 0
        });
        const cookies = await context.cookies();
        await page.click('input[title="Consultar Calificaciones del Estudiante"]');
        await page.waitForLoadState();
        const usuario = await page.evaluate(obtenerInformacion);
        await navegador.close();
        res.json({
            estatus:true,
            informacion:usuario,
            value: cookies[0].value
        });

    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`)
    }
}

const getCalificaiones = async (req = request, res = response)=>{
    const reanudarSession = [
        {
            sameSite: "Strict",
            name: "PHPSESSID",
            value: req.query.value,
            domain: "sira.univalle.edu.co",
            path: "/",
            expires: -1,
            httpOnly: true,
            secure: true
        }
    ];
   
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const context = await navegador.newContext();
        await context.addCookies(reanudarSession);
        const page = await context.newPage();
        await page.goto("https://sira.univalle.edu.co/sra/paquetes/inicioestudiante/index.php?accion=Inicio");
        await page.click('input[title="Consultar Calificaciones del Estudiante"]');
        await page.waitForLoadState();
        await page.click('input[name="DetalleCarpeta"]')
        await page.click('input[value="Generar Carpeta"]')
        await page.waitForLoadState();
        const calificaion = await page.evaluate(obtenerCalificaciones);
        await navegador.close();
        res.json(calificaion); 
    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`)
    }
}

const getTabulado = async (req = request, res = response)=>{
    const reanudarSession = [
        {
            sameSite: "Strict",
            name: "PHPSESSID",
            value: req.query.value,
            domain: "sira.univalle.edu.co",
            path: "/",
            expires: -1,
            httpOnly: true,
            secure: true
        }
    ];
    const ruta = `./tabulados/${req.query.codigo}.pdf`;
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const context = await navegador.newContext();
        await context.addCookies(reanudarSession);
        const page = await context.newPage();
        await page.goto('https://sira.univalle.edu.co/sra/paquetes/inicioestudiante/index.php?accion=Inicio');
        await page.waitForLoadState();
        await page.evaluate(()=>{
          document.querySelectorAll('form[target="_blank"]')[1].setAttribute('target','_self');
        });
        await page.click('input[title="Consultar Tabulado"]');
        await page.waitForLoadState();
        await page.pdf({path: ruta})
        res.download(ruta)
        await navegador.close();
        try {
            await fs.unlink(ruta);
          } catch(err) {
            console.error('Ocurrió algo malo al eliminar el archivo:', err)
          }
    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`)
    }
}

module.exports={
    getInformacionSIRA,
    getCalificaiones,
    getTabulado
}