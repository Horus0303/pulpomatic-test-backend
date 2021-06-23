const axios = require('axios')
const moment = require('moment')

const { reduceCurrencyOrg } = require('../utils/helpers')

// Classes
const LowDbCls = require('../classes/lowDbCls')

module.exports = class mainController {
    constructor() {
        this.lastFiveArr = []
        this.lastFoursArr = []
        this.lastThreeArr = []
        this.lastTwoArr = []
        this.lastOneArr = []
        this.currentArr = []

        this.lowDb = new LowDbCls()
    }

    /******************************/
    /******** EXTRACT DATA ********/
    /******************************/
    async extractData(req, res) {
        try {
            /***** Request Params ******/
            const { countryCode, year } = req.body

            /***** Main objects  *****/
            let contributions = null
            let responseData = null
            let haveYears = true
            let yearsArr = []
            
            /***** Get contibutions for code *****/
            contributions = await this.lowDb.getContributionsForCode(countryCode)
            
            if( contributions.length > 0 ) {
                /***** Get key-years of contributions ******/
                const hasYears = Object.keys(contributions[0])

                /***** Check if we have the required information from the years *****/
                for (let index = 0; index <= 5; index++) {
                    const yearIndex = moment(year).subtract(index, 'year').year().toString()
                    yearsArr.push(yearIndex)
                    if( !hasYears.includes(yearIndex) ) {
                        haveYears = false
                    }
                }

                /***** If we don't have, extract information from the api *****/
                if( !haveYears ) {
                    contributions = await this.mainExtractMethod(countryCode, year)
                    
                    responseData = yearsArr.map(resp => {
                        if( contributions[resp] ) {
                            return { [resp]: contributions[resp] }
                        }
                    })
                } 
                /***** Get information data from json db *****/
                else {
                    responseData = yearsArr.map(resp => {
                        if( contributions[0][resp] ) {
                            return { [resp]: contributions[0][resp] }
                        }
                    })
                }
            } else {
                /***** Get information from json db *****/
                contributions = await this.mainExtractMethod(countryCode, year)
                
                for (let index = 0; index <= 5; index++) yearsArr.push(moment(year).subtract(index, 'year').year().toString()) 
                
                responseData = await yearsArr.map(resp => {
                    if( contributions[resp] ) {
                        return { [resp]: contributions[resp] }
                    }
                })
                
            }
            res.send(responseData)
        } catch (error) {
            console.log(error);
        }
    }

    /*******************************/
    /****** GET ALL COUNTRIES ******/
    /*******************************/
    async getAllCountries() {
        /***** Save data *****/
        const lowDb = new LowDbCls()
        const countriesCodes = await lowDb.getCountriesCode()
        
        return countriesCodes.map(country => country.code)
    }

    /*****************************/
    /**** MAIN EXTRACT METHOD ****/
    /*****************************/
    async mainExtractMethod(countryCode, year) {
        try {
            /***** Request Params ******/
            const lastFiveYears = moment(year).subtract(5, 'year').year()
            const lastFourYears = moment(year).subtract(4, 'year').year()
            const lastThreeYears = moment(year).subtract(3, 'year').year()
            const lastTwoYears = moment(year).subtract(2, 'year').year()
            const lastOneYears = moment(year).subtract(1, 'year').year()
            const currentYear = moment(year).subtract(0, 'year').year()

            /***** Extract process *****/
            await this.structureProcess(countryCode, year)
            
            /***** Build main data for response and json db *****/
            const mainResponse = [{
                [currentYear]: reduceCurrencyOrg(this.currentArr),
                [lastOneYears]: reduceCurrencyOrg(this.lastOneArr),
                [lastTwoYears]: reduceCurrencyOrg(this.lastTwoArr),
                [lastThreeYears]: reduceCurrencyOrg(this.lastThreeArr),
                [lastFourYears]: reduceCurrencyOrg(this.lastFoursArr),
                [lastFiveYears]: reduceCurrencyOrg(this.lastFiveArr),
            }]

            /***** Save data *****/
            const lowDb = new LowDbCls()
            await lowDb.addRegisters(mainResponse[0], countryCode)       
            
            // Logger

            return mainResponse[0]
        } catch (error) {
            console.log(error);
        }
    }

    /******************************/
    /*** DATA STRUCTURE PROCESS ***/
    /******************************/
    async structureProcess(countryCode, year) {
        let start = 1
        let rows = 50
        let exit = false
            
        do {
            const responseApi = await axios.get(`
                ${process.env.URL_API}/search/activity?q=(recipient_country_code:(${countryCode}) OR transaction_recipient_country_code:(SD)) AND (activity_date_start_actual_f:[2016-01-01T00:00:00Z TO *] OR (-activity_date_start_actual_f:[* TO *]
                AND activity_date_start_planned_f:[2016-01-01T00:00:00Z TO *]))&start=${start}&fl=budget_*,participating_org_*,reporting_org_*&wt=json&rows=${rows}
            `)

            for (let index = 0; index < responseApi.data.response.docs.length; index++) {
                const register = responseApi.data.response.docs[index];
                
                if( register.budget_value_date !== undefined ) {
                    if( register.budget_value_date.length > 1 ) {
                        register.budget_value_date.map((budget, index) => {
                            /***** Last 5 years *****/
                            if( moment(year).subtract(5, 'year').year() === moment(budget).year() ) {
                                if( register.reporting_org_narrative !== undefined ) {
                                    this.lastFiveArr.push({
                                        currency: register.budget_value_usd[index],
                                        organization: register.reporting_org_narrative[index] !== undefined ? register.reporting_org_narrative[index] :  register.reporting_org_narrative[0]
                                    })
                                }
                            } 
                            /***** Last 4 years *****/
                            else if( moment(year).subtract(4, 'year').year() === moment(budget).year() ) {
                                if( register.reporting_org_narrative !== undefined ) {
                                    this.lastFoursArr.push({
                                        currency: register.budget_value_usd[index],
                                        organization: register.reporting_org_narrative[index] !== undefined ? register.reporting_org_narrative[index] :  register.reporting_org_narrative[0]
                                    })
                                }
                            }
                            /***** Last 3 years *****/
                            else if( moment(year).subtract(3, 'year').year() === moment(budget).year() ) {
                                if( register.reporting_org_narrative !== undefined ) {
                                    this.lastThreeArr.push({
                                        currency: register.budget_value_usd[index],
                                        organization: register.reporting_org_narrative[index] !== undefined ? register.reporting_org_narrative[index] :  register.reporting_org_narrative[0]
                                    })
                                }
                            }
                            /***** Last 2 years *****/
                            else if( moment(year).subtract(2, 'year').year() === moment(budget).year() ) {
                                if( register.reporting_org_narrative !== undefined ) {
                                    this.lastTwoArr.push({
                                        currency: register.budget_value_usd[index],
                                        organization: register.reporting_org_narrative[index] !== undefined ? register.reporting_org_narrative[index] :  register.reporting_org_narrative[0]
                                    })
                                }
                            }
                            /***** Last 1 years *****/
                            else if( moment(year).subtract(1, 'year').year() === moment(budget).year() ) {
                                if( register.reporting_org_narrative !== undefined ) {
                                    this.lastOneArr.push({
                                        currency: register.budget_value_usd[index],
                                        organization: register.reporting_org_narrative[index] !== undefined ? register.reporting_org_narrative[index] :  register.reporting_org_narrative[0]
                                    })
                                }
                            } 
                            /***** Current year *****/
                            else if( moment(year).subtract(0, 'year').year() === moment(budget).year() ) {
                                if( register.reporting_org_narrative !== undefined ) {
                                    this.currentArr.push({
                                        currency: register.budget_value_usd[index],
                                        organization: register.reporting_org_narrative[index] !== undefined ? register.reporting_org_narrative[index] :  register.reporting_org_narrative[0]
                                    })
                                }
                            } 
                        })
                    } else {
                        /***** Last 5 years *****/
                        if( moment(year).subtract(5, 'year').year() === moment(register.budget_value_date[0]).year() ) {
                            this.lastFiveArr.push({
                                currency: register.budget_value_usd[0],
                                organization: register.reporting_org_narrative[0]
                            })
                        }
                        /***** Last 4 years *****/
                        else if( moment(year).subtract(4, 'year').year() === moment(register.budget_value_date[0]).year() ) {
                            this.lastFoursArr.push({
                                currency: register.budget_value_usd[0],
                                organization: register.reporting_org_narrative[0]
                            })
                        }
                        /***** Last 3 years *****/
                        else if( moment(year).subtract(3, 'year').year() === moment(register.budget_value_date[0]).year() ) {
                            this.lastThreeArr.push({
                                currency: register.budget_value_usd[0],
                                organization: register.reporting_org_narrative[0]
                            })
                        }
                        /***** Last 2 years *****/
                        else if( moment(year).subtract(2, 'year').year() === moment(register.budget_value_date[0]).year() ) {
                            this.lastTwoArr.push({
                                currency: register.budget_value_usd[0],
                                organization: register.reporting_org_narrative[0]
                            })
                        }
                        /***** Last 1 years *****/
                        else if( moment(year).subtract(1, 'year').year() === moment(register.budget_value_date[0]).year() ) {
                            this.lastOneArr.push({
                                currency: register.budget_value_usd[0],
                                organization: register.reporting_org_narrative[0]
                            })
                        }
                        /***** Current year *****/
                        else if( moment(year).subtract(0, 'year').year() === moment(register.budget_value_date[0]).year() ) {
                            this.lastOneArr.push({
                                currency: register.budget_value_usd[0],
                                organization: register.reporting_org_narrative[0]
                            })
                        }
                    }
                }
            }

            /***** If start < 1 exit from loop *****/
            if( start > 1 ) {
                exit = true    
            }

            start = rows
            rows = responseApi.data.response.numFound
        } while ( !exit );
    }
}