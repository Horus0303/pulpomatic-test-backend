const cron = require('node-cron');
const mainControllerCls = require('../controllers/mainController')

const realoadContributionsData = async () => {
    const mainController = new mainControllerCls()
    
    const countriesCodes = await mainController.getAllCountries()

    const arrTemp = Array(330)
    let patternMinute = 00
    let patternHour = 4

    const arrayNewTemp = Array.from({ length: Math.ceil(countriesCodes.length / 10) }, (v, i) =>
        countriesCodes.slice(i * 10, i * 10 + 10)
    );
    
    for (let index = 0; index < arrayNewTemp.length; index++) {
        const parentGroup = arrayNewTemp[index];

        for (let index = 0; index < parentGroup.length; index++) {
            const element = parentGroup[index];

            const task = cron.schedule(`${patternMinute} ${patternHour} * * *`, async () => {
                await mainController.mainExtractMethod(element, null)
            }, {
                scheduled: false
            });

            task.start()
        }

        patternMinute += 5

        if( patternMinute >= 60 ) {
            patternMinute = 0
            patternHour ++
        }

        // console.log('NEXT');
        // console.log(`${patternMinute} ${patternHour} * * *`);
        // console.log('\n');
    }
}

module.exports = {
    realoadContributionsData
}