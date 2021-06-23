const lowDbCls = require('../classes/lowDbCls')

const { contributions, countryCode } = require('../__tests__/fixtures/contributionFixtures')
/***** Instance lowDb *****/
const lowDb = new lowDbCls()

try {
    /**** Reset contributions tests *****/
    lowDb.resetContributions()

    /***** Add contribution register *****/
    lowDb.addRegisters(contributions, countryCode)
    
    console.log('Datos cargados exitosamente');
} catch (error) {
    console.log(error);
}