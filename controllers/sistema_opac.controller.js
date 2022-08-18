const { chromium } = require("playwright-chromium");
const {request, response} = require('express');

const getInformacionPrimariaOPAC = async (req = request, res = response)=>{
    const codigo = req.query.codigo;
    try{
    const navegador = await chromium.launch({ chromiumSandbox: false });
    const page = await navegador.newPage();
    await page.goto("https://opac.univalle.edu.co/cgi-olib/");
    await page.waitForLoadState();
    await page.fill('input[id="login1"]', codigo);
    await page.evaluate(()=>{
        document.querySelector('input[value=" Ingresar "]').click();
    })
    
    await page.waitForTimeout(5000)
    const evaluarUsuario = await page.evaluate(()=>{
        if(document.querySelector('#login1') == null){
            return true;
        }else return false;
    });
   
    if(!evaluarUsuario) {
        return  res.status(400).json({
            error: 'El usuario no existe',
        });
    }
      const fechaExpiracion = await page.evaluate(()=>{
          return document.querySelector('#user_expdate_text').innerText;
      });
      const apellido = await page.evaluate(()=>{
        return document.querySelector('#user_sname_text').innerText;
      });
      const nombre = await page.evaluate(()=>{
        return document.querySelector('#user_fname_text').innerText;
      });
      const multa = await page.evaluate(()=>{
          return document.querySelector('#user_CURBAL_text').innerText;
      });
      const librosPrestados = await page.evaluate(()=>{
          if(document.querySelector('#tabcontent_Title1>#user_tab_loan>.details_tab_copy>.tabcont_vscroll_full>table>tbody') != null){
              const libros = document.querySelector('.details_tab_copy').querySelectorAll('table>tbody>tr')
              const libro = new Array(5);
              const prestamos = new Array(libros.length - 1);
              for(let i=0; i<libros.length - 1; i++){
                  for(let j=0; j < libros[i + 1].querySelectorAll('td').length - 1; j++){
                      libro[j] = libros[i + 1].querySelectorAll('td')[j].innerText;
                      }
                  prestamos[i] = {
                      index: i + 1,
                      codigo:libro[0],
                      titulo: libro[1],
                      fecha: libro[3],
                      multa:libro[4]
                  }
              }
              return prestamos
          }
          document.querySelector('#tab_Title3').click();
          return [];
      });
  
      const historialPrestamos = await page.evaluate(()=>{
          if(document.querySelector('#tabcontent_Title3>#user_tab_hist>.details_tab_copy>table>tbody') != null){
              const  libros = document.querySelector('.details_tab_copy>table>tbody').querySelectorAll('tr');
              const libro = new Array(5);
              const historial = new Array(libros.length - 1);
              for(let i=0; i<libros.length - 1; i++){
                  for(let j=0; j < libros[i + 1].querySelectorAll('td').length; j++){
                      libro[j] = libros[i + 1].querySelectorAll('td')[j].innerText;
                  }
                  historial[i] = {
                      codigo:libro[0],
                      titulo: libro[1],
                      fecha: libro[4],
                  }
              }
              return historial;
          }
         return [];
      });
      await navegador.close();

      res.json({
            nombre,
            apellido,
            fechaExpiracion,
            multa,
            librosPrestados,
            historialPrestamos 
         });
    
  
    } catch (error) {
            res.status(500).send(`Algo salió mal: ${error}`);
     } 
};

const actualizarLibro = async (req = request, res = response)=>{
    const codigo = req.query.codigo;
    const libro = parseInt(req.params.index);
    try{
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const page = await navegador.newPage();
        await page.goto("https://opac.univalle.edu.co/cgi-olib/");
        await page.waitForLoadState();
        await page.fill('input[id="login1"]', codigo)
        await page.evaluate(()=>{
            document.querySelector('input[value=" Ingresar "]').click();
        })
        await page.waitForTimeout(5000);
    
        await page.evaluate((index)=>{
          const libros = document.querySelector('.details_tab_copy').querySelectorAll('table>tbody>tr');
          libros[index].querySelectorAll('td')[5].querySelector('span>img').click();
          return libros[index].querySelectorAll('td')[5].innerText;
        }, libro);
        await page.waitForTimeout(2000);
        const actualizarLibro = await page.evaluate((index)=>{
            const libros = document.querySelector('.details_tab_copy').querySelectorAll('table>tbody>tr');
            return libros[index].querySelectorAll('td')[5].innerText;
          }, libro);
        await page.close();
        res.json({
          estado: [actualizarLibro]
        });
  
    } catch (error) {
            res.status(500).send(`Algo salió mal: ${error}`);
     } 
};

const actualizarTodo = async (req = request, res = response)=>{
    const codigo = req.query.codigo;
    try{
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const page = await navegador.newPage();
        await page.goto("https://opac.univalle.edu.co/cgi-olib/");
        await page.waitForLoadState();
        await page.fill('input[id="login1"]', codigo)
        await page.evaluate(()=>{
            document.querySelector('input[value=" Ingresar "]').click();
        })
        await page.waitForTimeout(5000);
    
        await page.evaluate(()=>{
            document.querySelector('img[title="Renovar todos los artículos"]').click();
          });

        await page.waitForTimeout(2000);
        const actualizarLosLibros = await page.evaluate(()=>{
            const libros = document.querySelector('.details_tab_copy').querySelectorAll('table>tbody>tr');
            const estados = new Array(libros.length - 1);
            for(let i=0; i<libros.length - 1; i++){
                estados[i] = libros[i + 1].querySelectorAll('td')[5].innerText;
            }
           return estados;
        });
        await page.close();
        res.json({
          estado: actualizarLosLibros
        });
  
    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`);
     } 
};


const buscador = async(req = request, res = response)=>{
    const { parametro } = req.query;
    const noImagen = req.protocol + '://' + req.get('host') + '/images/no-imagen.jpg';
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const page = await navegador.newPage();
        await page.goto("https://opac.univalle.edu.co/cgi-olib/");
        await page.waitForLoadState();
        await page.fill('input#searchInputField1', parametro.replace('%20',' '));
        await page.click('.searchButton');
        await page.waitForTimeout(5000);
        const resultados = await page.evaluate((url)=>{
            if(document.querySelector('.title_hitlist>table>tbody') != null){
                const resultados = document.querySelector('.title_hitlist>table>tbody').querySelectorAll('.hitlist_ticol');
                const libros = new Array(resultados.length);
                resultados.forEach((libro, index) =>{
                    const id = libro.querySelector('.resultsbright>a').id.replace('hitlabel','');
                    const nombre = libro.querySelector('.resultsbright').innerText;
                    const autor = libro.querySelector('.extras').innerText.split('\n')[1];

                    let ISBN = '';
                    let detalle = '';
                    let ejemplares = '';
                    let imagen = '';
                    
                    if(libro.querySelector('.extras').innerText.includes('ISBN: ')){
                        ISBN  = libro.querySelector('.extras').innerText.split('\n')[2].replaceAll('ISBN: ','');
                        detalle  = libro.querySelector('.tihitlist_l3').innerText.split('\n')[0].replace(' ','');
                        ejemplares = libro.querySelector('.tihitlist_l3').innerText.split('\n')[1];
                        imagen = `http://covers.openlibrary.org/b/isbn/${ISBN}-L.jpg`
                    }else{
                        ISBN = '';
                        detalle = libro.querySelector('.tihitlist_l3').innerText.split('\n')[0].replace(' ','');
                        ejemplares = libro.querySelector('.tihitlist_l3').innerText.split('\n')[1];
                        imagen = url
                    }
                   
                    libros[index] = {imagen,id, nombre, autor,ISBN, detalle, ejemplares}
                 });
            return libros;
            } return [];
            
        }, noImagen);
       
        await navegador.close();
        res.json({
            resultados
        });

    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`);
    }
}

const detalles = async(req = request, res = response)=>{
    const { id } = req.params;
    const noImagen = req.protocol + '://' + req.get('host') + '/images/no-imagen.jpg';
    try {
        const navegador = await chromium.launch({ chromiumSandbox: false });
        const page = await navegador.newPage();
        await page.goto(`https://opac.univalle.edu.co/cgi-olib/?oid=${id}`);
        await page.waitForLoadState();
        await page.waitForTimeout(20000);
        const imagen = await page.evaluate((url)=>{
            if(document.querySelector('#details_bkjacket>a') != null) return document.querySelector('#details_bkjacket>a').href.replace('-M.', '-L.')
            return url;
        }, noImagen);
        const resumen = await page.evaluate(()=>{
            if(document.querySelector('div#details_abstract_tab>div.details_tab_other') != null) {
                return document.querySelector('div#details_abstract_tab>div.details_tab_other').innerText;
            }
            return 'Resumen no disponible';
        });
        const detallesDisponibilidad = await page.evaluate(()=>{
            if(document.querySelector('.details_tab_copy.tabcont_vscroll_full>table>tbody') != null){
                const contenido = document.querySelector('.details_tab_copy.tabcont_vscroll_full>table>tbody').querySelectorAll('tr');

                const disponibilidad = new Array(contenido.length - 1);
                for(let i = 0; i < disponibilidad.length; i++ ){
                    const contenidoEjemplar = contenido[i + 1].querySelectorAll('td');
                    const detalle = new Array(contenidoEjemplar.length);
                        contenidoEjemplar.forEach((ubicacion, j)=>{
                            detalle[j] = ubicacion.innerText;
                        });
                    const [codigo, localizacion, estante, signatura,coleccion, estado, categoria] = detalle;
                    disponibilidad[i] = {codigo,localizacion, estante, signatura,coleccion,estado, categoria}   
                  
                }
            return disponibilidad
        
            } return [];
            
        });

        await navegador.close();
        res.json({
            imagen,
            resumen,
            detallesDisponibilidad
        });

    } catch (error) {
        res.status(500).send(`Algo salió mal: ${error}`);
    }
}

module.exports = {
    getInformacionPrimariaOPAC,
    actualizarLibro,
    actualizarTodo,
    detalles,
    buscador
}