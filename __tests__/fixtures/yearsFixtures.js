const moment = require('moment')

const yearsArr = []
for (let index = 0; index <= 5 ; index++) {
    yearsArr.push(moment().subtract(index, 'year').year())
    
}

module.exports = { yearsArr }