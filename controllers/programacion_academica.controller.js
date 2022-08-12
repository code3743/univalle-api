const { chromium } = require("playwright-chromium");
const {request, response} = require('express');

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


const getInformacionIncial =  (req = request, res = response)=>{

  const sedes = [
    {
       value: "00",
       nombre: "CALI"
    },
    {
        value: "01",
        nombre: "BUGA"
    },
    {
        value: "02",
        nombre: "CAICEDONIA"
    },
    {
        value: "03",
        nombre: "CARTAGO"
    },
    {
        value: "04",
        nombre: "PACIFICO"
    },
    {
        value: "05",
        nombre: "PALMIRA"
    },
    {
        value: "06",
        nombre: "TULUA"
    },
    {
        value: "07",
        nombre: "ZARZAL"
    },
    {
        value: "14",
        nombre: "YUMBO"
    },
    {
        value: "21",
        nombre: "NORTE DEL CAUCA"
    }
];

const facultades = [
  {
    value: "1",
    nombre: "CIENCIAS NATURALES Y EXACTAS"
  },
  {
    value: "2",
    nombre: "HUMANIDADES"
  },
  {
    value: "3",
    nombre: "CIENCIAS SOCIALES Y ECONÓMICAS"
  },
  {
    value: "4",
    nombre: "EDUCACIÓN Y PEDAGOGÍA"
  },
  {
    value: "4A",
    nombre: "PSICOLOGÍA"
  },
  {
    value: "5",
    nombre: "ARTES INTEGRADAS"
  },
  {
    value: "6",
    nombre: "SALUD"
  },
  {
    value: "7",
    nombre: "INGENIERÍA"
  },
  {
    value: "8",
    nombre: "CIENCIAS DE LA ADMINISTRACIÓN"
  },
  {
    value: "9",
    nombre: "OTRAS FACULTADES"
  },
  {
    value: "9A",
    nombre: "DIRECCIÓN DE REGIONALIZACIÓN"
  },
  {
    value: "9B",
    nombre: "DIRECCIÓN PLAN DE NIVELACIÓN TALENTOS PILOS"
  }
];

  res.json(
    {
      sedes,
      facultades
    }
  );
}

const desplegarInformacion = async (req = request, res = response)=>{
    const {sede, facultad } = req.params;
    const url = `https://sira1.univalle.edu.co/sra/paquetes/programacionacademica/index_publico.php?accion=desplegarFormularioConsultarProgramacion&sed_codigo=${sede}&facultad=${facultad}`
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
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
        await navegador.close();
        res.json(opciones);
    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`);
    }
}

const consultarInformacion =  async (req = request, res = response)=>{
    const { sede, facultad, parametro} = req.params;
    const {tipoConsulta} = req.query;
    const consulta = parseInt(tipoConsulta) == 1 ? 'select[name="una_codigo"]': 'select[name="pra_codigo"]';
    const url = `https://sira1.univalle.edu.co/sra/paquetes/programacionacademica/index_publico.php?accion=desplegarFormularioConsultarProgramacion&sed_codigo=${sede}&facultad=${facultad}`
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const page = await navegador.newPage();
        await page.goto(url);
        await page.waitForLoadState();
        await page.evaluate((i)=>{
          document.querySelector('form').setAttribute('target','_self');
          document.querySelectorAll('input[value="Consultar Programación Académica"]')[i].setAttribute("id",i)
        },parseInt(tipoConsulta));
        await page.selectOption(consulta,parametro);
        await page.click(`input[id="${tipoConsulta}"]`);
        await page.waitForLoadState();
        const ofertas = await page.evaluate(obtenerAsignaturasOferta);
        res.json(ofertas);
        await navegador.close();
    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`);
    }
}

const getElectivas = async (req = request, res = response)=>{
    const {sede} = req.params;
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
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
    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`);
    }
}


module.exports = {
    desplegarInformacion,
    consultarInformacion,
    getElectivas,
    getInformacionIncial
}