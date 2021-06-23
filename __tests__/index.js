const supertest = require('supertest')
const { app, server } = require('../server')
const api = supertest(app)

// LowDB
const lowDbCls = require('../classes/lowDbCls')
const lowDb = new lowDbCls()

// Fixtures
const { contributions, countryCode } = require('./fixtures/contributionFixtures')
const { yearsArr } = require('./fixtures/yearsFixtures')

// External libs
const Promise = require("bluebird");

// Main objects
let response = null
let haveYears = false

beforeEach(async () => {
    return await new Promise(async resolve => {
        await lowDb.addRegisters(contributions, countryCode)
        await resolve(true);
    })
})

/***************************************************/
test('The api returned a json', async () => {
    response = await api.post('/contriesContributions').send({
        "countryCode": "MX",
        "year": "2021"
    }).expect(200).expect('Content-Type', /application\/json/)
    
    expect(typeof response).toBe('object')
}, 30000)

/***************************************************/
test('The response has the correct years', async () => {
    response = await api.post('/contriesContributions').send({
        "countryCode": "MX",
        "year": "2021"
    })

    const hasYears = Object.keys(response.body[0])
    for (let index = 0; index < yearsArr.length; index++) {
        const yearIndex = yearsArr[index];
        
        if( !hasYears.includes(yearIndex) ) {
            haveYears = true
        }
    }
    
    expect(haveYears).toBe(true)
}, 30000)

/***************************************************/
test('The response has the correct order currency', async () => {
    response = await api.post('/contriesContributions').send({
        "countryCode": "MX",
        "year": "2021"
    })

    let hasOrderCorrect = false

    for (let index = 0; index < response.body.length; index++) {
        const yearIndex = response.body[index];
        const element = Object.entries(yearIndex[yearsArr[index]]);
        const elementKeys =  Object.keys(yearIndex[yearsArr[index]])

        if( element[0][1] > element[elementKeys.length -1][1] ) {
            hasOrderCorrect = true
        }
    }

    expect(hasOrderCorrect).toBe(true)
}, 30000)

afterAll(async () => {
    server.close()
     
    /***** Reset contributions tests *****/
    // await lowDb.resetContributions()
})