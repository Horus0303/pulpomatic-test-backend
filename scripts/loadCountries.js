const lowDbCls = require('../classes/lowDbCls')
let rawdata = require('./countries.json');

/***** Instance lowDb *****/
const lowDb = new lowDbCls()

try {
    /***** Reset countries  ******/
    lowDb.resetCountries()
    
    for (let index = 0; index < rawdata.Country.length; index++) {
        const country = rawdata.Country[index];
        
        lowDb.loadCountries(country.code, country.name)
    }
    
    console.log('Datos cargados exitosamente');
} catch (error) {
    console.log(error);
}