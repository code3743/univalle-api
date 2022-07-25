const express = require("express");
const { chromium } = require("playwright");
const path = require("path");
require("dotenv").config();
const publicPath = path.resolve(__dirname, "public");
const app = express();

app.use(express.urlencoded({extended: false, type: 'application/x-www-form-urlencoded'}));
app.use(express.static(publicPath));


const obtenerInformacion = () => {
    let bloqueInformacionPersonal = document.querySelector('table>tbody>tr>td>table>tbody>tr>td>font').innerText.split('\n');
    let bloquesIndividuales = new Array(bloqueInformacionPersonal.length);
    for(var i= 0; i<bloqueInformacionPersonal.length; i++){
       const informacion = bloqueInformacionPersonal[i].split(': ')
        bloquesIndividuales[i] = informacion[1]
    }
    let estudiante = bloquesIndividuales[0].split(' -- ');
    let documento = bloquesIndividuales[1].split(' ');
    let programa = bloquesIndividuales[2].split('-');

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
        corre: bloquesIndividuales[3]
        }
}
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
       }
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
}


const obtenerTabulado = () =>{
    const tablasAsignaturas = document.querySelectorAll('table>tbody>tr>td>table');
    const coleccionAsignaturas = tablasAsignaturas[1].querySelector('tbody>tr>td[colspan="3"]>table>tbody');
    const infoAsignaturas = coleccionAsignaturas.querySelectorAll('tr>td.normalnegro');
    const materias = [];
    const materia = new Array(10)
    let auxiliar = 0;
    for(let i= 0; i<infoAsignaturas.length; i++){
      materia[auxiliar] = infoAsignaturas[i].innerText;
      auxiliar++;
      if(auxiliar == 10){
        auxiliar=0;
        materias.push({
          codigo: materia[0],
          grupo:materia[1],
          asignatura:materia[2],
          creditos:materia[5],
          calificacion:materia[7]
        });
      }
    }

    return {
      asignaturasMatriculadas:coleccionAsignaturas.querySelectorAll('tr>td>span.minirojo')[0].innerText,
      asignaturasCanceladas:coleccionAsignaturas.querySelectorAll('tr>td>span.minirojo')[1].innerText,
      totalCreditos:coleccionAsignaturas.querySelectorAll('tr>td>span.minirojo')[2].innerText,
      asignaturas: materias
    };
}

const obtenerAsignaturasOferta = () =>{
  if (document.querySelectorAll("table>tbody>tr>td>table>tbody").length > 0){
      const coleccionTablas = document.querySelectorAll(
        "table>tbody>tr>td>table>tbody"
      );
      let codigoAsignatura = "-";
      let nombreAsignatura = "-";
      const asignatura = [];
      const apeturaPorAsignatura = new Array(9);
      for (let i = 0; i < coleccionTablas.length; i++) {
        const aperturaTotal = [];
        const tablaApertura = coleccionTablas[i].querySelectorAll(
          'tr>td[bgcolor="#EBE6EA"]'
        );
        let auxiliar = 0;
        if (coleccionTablas[i].querySelectorAll("tr>td>font")[0].textContent.length > 2) {
          const temp = coleccionTablas[i]
            .querySelectorAll("tr>td>font")[0]
            .textContent.split(" -> ");
          codigoAsignatura = temp[0];
          nombreAsignatura = temp[1];
        }
         for  (let j = 0; j < tablaApertura.length; j++) {
          if (tablaApertura[j].textContent != " ") {
            apeturaPorAsignatura[auxiliar] = tablaApertura[j].textContent;
          } else apeturaPorAsignatura[auxiliar] = "-";

          if (auxiliar == 5 && tablaApertura[j].textContent.length > 2) {
            let temp = tablaApertura[j].innerText.split("\n\n");
            apeturaPorAsignatura[auxiliar] = {
              nombre: temp[0],
              corre: temp[1],
            };
          } else if (auxiliar == 5) {
            apeturaPorAsignatura[auxiliar] = {
              nombre: "-",
              corre: "-",
            };
          }
          auxiliar++;
          if (auxiliar == 9) {
            auxiliar = 0;
             aperturaTotal.push({
              periodoAcademico: apeturaPorAsignatura[1].replace(" ", ""),
              grupo: apeturaPorAsignatura[2],
              cupo: apeturaPorAsignatura[3].replace(" ", ""),
              horario: apeturaPorAsignatura[4].replace(" ", ""),
              docente: apeturaPorAsignatura[5],
              programa: apeturaPorAsignatura[6].replace(" ", ""),
            });
          }
        }
        asignatura.push({
          codigoAsignatura: codigoAsignatura,
          nombreAsignatura: nombreAsignatura,
          credito:
            coleccionTablas[i].querySelectorAll("tr>td>font")[1].textContent,
          apertura: aperturaTotal,
        });
      }
      return {estatus: true, asignatura: asignatura};
    } else return {estatus: false, asignatura: []};
};

app.post("/sira", function (req, res) {
  const codigo = req.body.codigo;
  const clave = req.body.clave;
  let navegador;
  (async ()=>{
    navegador = await chromium.launch();
    const context = await navegador.newContext();
    const page = await context.newPage();
    await page.goto("https://sira.univalle.edu.co/sra/");
    await page.type('input[name="usu_login_aut"]',codigo);
    await page.type('input[name="usu_password_aut"]',clave);
    await page.click('input[name="boton"]');
    await page.waitForLoadState();
    const seccionInciada = await page.$('table[name="tablaEncabezado"]');
    if (seccionInciada != null){
        const cookies = await context.cookies();
        await page.click('input[title="Consultar Calificaciones del Estudiante"]');
        await page.waitForLoadState();
        const usuario = await page.evaluate(obtenerInformacion);
        res.send({
            estatus:true,
            informacion:usuario,
            value: cookies[0].value
        });
    }else{
        res.send({
            estatus: false,
            informacion:[],
            value: 0
        });
    }
    await page.close();
  })()
  .catch((err) => res.sendStatus(500))
  .finally(async()=> navegador.close());

});

app.post("/tabulado", function(req, res){
  const reanudarSession = [
      {
          sameSite: "Strict",
          name: "PHPSESSID",
          value: req.body.value,
          domain: "sira.univalle.edu.co",
          path: "/",
          expires: -1,
          httpOnly: true,
          secure: true
      }
  ]
  let navegador;
  (async ()=>{
      navegador = await chromium.launch();
      const context = await navegador.newContext();
      await context.addCookies(reanudarSession);
      const page = await context.newPage();
      await page.goto('https://sira.univalle.edu.co/sra/paquetes/inicioestudiante/index.php?accion=Inicio');
      await page.waitForLoadState()
      await page.evaluate(()=>{
        document.querySelectorAll('form[target="_blank"]')[1].setAttribute('target','_self');
      });
      await page.click('input[title="Consultar Tabulado"]');
      await page.waitForLoadState();
      const tabuladoImpreso = await page.content();
      console.log(tabuladoImpreso);
      await page.pdf({path: '/tabulados/tabulado'})
      const tabulado = await page.evaluate(obtenerTabulado);
      res.send(tabulado)
      await page.close();
  })()
  .catch((err) => res.sendStatus(500))
  .finally(async()=> navegador.close());
});

app.post("/calificaciones", function(req, res){
  const reanudarSession = [
      {
          sameSite: "Strict",
          name: "PHPSESSID",
          value: req.body.value,
          domain: "sira.univalle.edu.co",
          path: "/",
          expires: -1,
          httpOnly: true,
          secure: true
      }
  ]
  let navegador;
  (async ()=>{
      navegador = await chromium.launch();
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
      res.send(calificaion);
      await page.close()
  })()
  .catch((err) => res.sendStatus(500))
  .finally(async()=> navegador.close());
});

app.get("/desplegar-informacion", function(req, res){
  const sede = req.query.sede;
  const facultad = req.query.facultad;
  const url = `https://sira1.univalle.edu.co/sra/paquetes/programacionacademica/index_publico.php?accion=desplegarFormularioConsultarProgramacion&sed_codigo=${sede}&facultad=${facultad}`
  let navegador;
  (async () =>{
    navegador = await chromium.launch();
    const page = await navegador.newPage();
    await page.goto(url);
    await page.waitForLoadState();
    const opciones = await page.evaluate(()=>{
      const unidadAcademica = document.querySelectorAll('select[name="una_codigo"]>option');
      document.querySelector('select[name="pra_codigo"]>option').remove();
      const programaAcademico = document.querySelectorAll('select[name="pra_codigo"]>option');
   

      const recorrer = (tabla) =>{
        const resultadoRecorrido = new Array(tabla.length);
        for(let i=0; i<tabla.length; i++){
          let opt = tabla[i].innerText.split(' -> ')
          resultadoRecorrido[i] = {
            value: tabla[i].value,
            nombre: opt[1]
          }
        }
          return resultadoRecorrido
      }
      
      const resultadoUnidad = recorrer(unidadAcademica);
      const resultadoPrograma = recorrer(programaAcademico);

      
      return {
        unidadAcademica: resultadoUnidad,
        programaAcademico: resultadoPrograma
      }
    });
    await page.close();
    res.send(opciones);
  })()
  .catch((err) => res.sendStatus(500))
  // .finally(async()=> await navegador.close());
});

app.get("/consulta-programacion", function(req, res){
  const sede = req.query.sede;
  const facultad = req.query.facultad;
  const consulta = parseInt(req.query.consulta);
  const value = req.query.value;
  let detalle = ""
  if (consulta == 1){
     detalle = 'select[name="una_codigo"]'
  }else detalle = 'select[name="pra_codigo"]'

  const url = `https://sira1.univalle.edu.co/sra/paquetes/programacionacademica/index_publico.php?accion=desplegarFormularioConsultarProgramacion&sed_codigo=${sede}&facultad=${facultad}`
  let navegador;
  (async () =>{
    navegador = await chromium.launch();
    const page = await navegador.newPage();
    await page.goto(url);
    await page.waitForLoadState();
    await page.evaluate((i)=>{
      document.querySelector('form').setAttribute('target','_self');
      document.querySelectorAll('input[value="Consultar Programación Académica"]')[i].setAttribute("id",i)
    },consulta);
    await page.selectOption(detalle,value);
    await page.click(`input[id="${consulta}"]`);
    await page.waitForLoadState();
    const ofertas = await page.evaluate(obtenerAsignaturasOferta)
    await page.close();
    res.send(ofertas);
  })()
  .catch((err) => res.sendStatus(500))
  .finally(async()=> await navegador.close());
});

app.get("/electivas", function (req, res) {
  const sede = req.query.sede;
  let navegador;
  (async () => {
    navegador = await chromium.launch();
    const page = await navegador.newPage();
    await page.goto(
      "https://sira.univalle.edu.co/sra/paquetes/programacionacademica/index_publico.php?accion=reporteDeProgramacionAcademicaEC"
    );
    await page.selectOption('select[name="sed_codigo"]', sede);
    await page.click('input[value="Consultar Programación"]');
    await page.waitForLoadState();
    const eletivas = await page.evaluate(obtenerAsignaturasOferta);
    await page.close();
    res.send(eletivas);
  })()
    .catch((err) => res.sendStatus(500))
    .finally(async () => await navegador.close());
});

app.get("/restaurante", function(req,res){
  let navegador;
  (async () => {
    navegador = await chromium.launch();
    const page = await navegador.newPage();
    await page.goto(
      "https://vicebienestar.univalle.edu.co/restaurante-universitario"
    );
    await page.waitForLoadState();
    await page.waitForTimeout(10000)
    const menuSemanal = await page.evaluate(()=>{
      const dias = document.querySelectorAll('.tabla-info>tbody>tr[style="height: 24px; background-color: #e4cccc;"]');
      const menuSemanal = new Array(5);
      const menuDelDia = new Array(7);
      for(let i=0; i<dias.length; i++){
        let dia = dias[i].querySelectorAll('td');
        for(let j=0; j<dia.length; j++){
          menuDelDia[j] = dia[j].innerText;
        }
        menuSemanal[i] = {
          dia: menuDelDia[0],
          sopa: menuDelDia[1],
          arroz: menuDelDia[2],
          carne: menuDelDia[3],
          principio: menuDelDia[4],
          ensalda: menuDelDia[5],
          jugo: menuDelDia[6]
        }
      }

      return {
        menuSemanal: menuSemanal
      }
    });
    console.log('Desdepues de evaluar')
    await page.close()
    res.send(menuSemanal)
})()
.catch((err)=> res.sendStatus(500))
.finally(async() => await navegador.close() )
});

app.listen(process.env.PORT, (err) => {
  if (err) throw new Error(err);
  console.log("Corriendo en el puerto: " + process.env.PORT);
});
