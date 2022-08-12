const { chromium } = require("playwright-chromium");
const {request, response} = require('express');

const getMenuSemana = async (req = request, res = response)=>{
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const page = await navegador.newPage();
        await page.goto("https://vicebienestar.univalle.edu.co/restaurante-universitario");
        await page.waitForLoadState();
      
        const menuSemanal = await page.evaluate(()=>{
            const dias = document.querySelectorAll('.tabla-info>tbody>tr[style="height: 24px; background-color: #e4cccc;"]');
            const menuSemanal = new Array(5);
            const menuDelDia = new Array(7);
            for(let i=0; i<dias.length; i++){
              let dia = dias[i].querySelectorAll('td');
                if (!(dia.length < 3)){
                  for(let j=0; j<dia.length; j++){

                    menuDelDia[j] = dia[j].innerText;
                  }
                }else {
                  for(let j=0; j<7; j++){

                    menuDelDia[j] = 'Sin servicio';
                  }
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
              menuSemanal
            }
          });
          await navegador.close();
          res.json(menuSemanal)

    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`)
    }
};


const getInformacionTiquetes = async (req = request, res = response)=>{
    const {codigo, clave } = req.body;

    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const page = await navegador.newPage();
        await page.goto("https://restauranteuniversitario.univalle.edu.co/restaurante.php/login");
        await page.waitForLoadState();
        await page.fill('#signin_username', codigo);
        await page.fill('#signin_password',clave);
        await page.click('input[value="Ingresar"]');
        await page.waitForLoadState();
        await page.evaluate(()=>{
            document.querySelector('.container-fluid>.navbar-collapse>#udf-menu-principal').querySelectorAll('li>a')[1].click();
        });
        await page.waitForLoadState();
        const informacion = await page.evaluate(()=>{
          const estamento = document.querySelectorAll('.form-control.input-sm.disabled')[5].innerText;
          const tiquetes = document.querySelectorAll('.form-control.input-sm.disabled')[7].innerText
    
          return {
            estamento,
            tiquetes
          }
        });
        await navegador.close()
        res.json(informacion);
    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`)
    }
};

module.exports = {
    getMenuSemana,
    getInformacionTiquetes
}