const FileSync = require('lowdb/adapters/FileSync')
const lodashId = require('lodash-id')
const lowDb = require('lowdb')

module.exports = class LowDbCls {
    constructor() {
        // Countries doc
        this.adapter = new FileSync('./databases/countries.json')
        this.dbCountries = lowDb(this.adapter)

        
        if( process.env.NODE_ENV === 'TEST' ) {
            // Contributions doc
            this.adapter2 = new FileSync('./databases/contributionsTest.json')
            this.dbContributions = lowDb(this.adapter2)

        } else {
            // Contributions doc
            this.adapter2 = new FileSync('./databases/contributions.json')
            this.dbContributions = lowDb(this.adapter2)
        }

        /*********** Countries Json Db ***********/
        this.dbCountries._.mixin(lodashId)
        this.countries = this.dbCountries.defaults({ countries: []}).get('countries')

        /*********** Contributions Json Db ***********/
        this.dbContributions._.mixin(lodashId)
        this.contributions = this.dbContributions.defaults({ contributions: [] }).get('contributions')
    }

    /*****************************************
    ************* ADD REGISTERS **************
    *****************************************/
    async addRegisters(params, countryCode) {
        const countryExists = this.countries.filter({code: countryCode}).value()[0]

        try {
            if( countryExists.length < 1 ) {
                throw new Error('NO EXISTE EL PAIS')
            }
        
            const countryId = countryExists.id
            
            /***** Get contributions by country ******/
            const contribByCountry = await this.contributions.filter({ countryId }).value()[0]
            
            /***** Remove contribution exists  *****/
            await this.contributions.remove({ countryId }).write()
            
            
            /***** Replace contribution data *****/
            const contributionsData = { ...contribByCountry, ...params, countryId }
            return await this.contributions.insert(contributionsData).write()
        } catch (error) {
            console.log(error);
        }
    }

    /*****************************************
    *** GET CONTRIBUTIONS FOR COUNTRY CODE ***
    *****************************************/
    async getContributionsForCode(code) {
        /***** Get country by code ******/
        const countryExists = this.countries.filter({ code }).value()[0]

        if( countryExists.length < 1 ) {
            throw new Error('NO EXISTE EL PAIS')
        }
        const countryId = countryExists.id
        
        /***** Get contributions by country ******/
        const contributionsExists = this.contributions.filter({ countryId }).value()

        return contributionsExists
    }

    /*****************************************
    ************ LOAD COUNTRIES **************
    *****************************************/
    async loadCountries(code, name) {
        try {
            let countryData = { code, name }
            await this.countries.insert(countryData).write()
        } catch (error) {
            console.log(error);
        }
    }

    /****************************************
    ********** GET COUNTRIES CODE ***********
    ****************************************/
    async getCountriesCode() {
        return this.countries.filter().value()
    }

    /****************************************
    ********** RESET CONTRIBUTIONS **********
    ****************************************/
    async resetContributions() {
        await this.dbContributions.set('contributions', [] ).write()
    }

    /****************************************
    ************ RESET COUNTRIES ************
    ****************************************/
    async resetCountries() {
        await this.dbCountries.set('countries', [] ).write()
    }
}