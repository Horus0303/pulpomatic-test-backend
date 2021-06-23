const express = require('express')
const bodyParser = require('body-parser')
const cluster = require('cluster')
const os = require('os')

require('dotenv').config({path: '.env'});

/********** Set envoriments **********/
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

/********** Swagger **********/
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Customer API',
            description: "Customer Information",
            contact: {
                name: 'Kevin Cruces'
            },
            servers: [{
                url: "http://localhost:3000"
            }]
        }
    },
    apis:['./routes/rootRoutes.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)

/********** Cluster logic **********/
const MasterWorkerCls = require('./classes/masterWorkerCls')

const masterWorker = new MasterWorkerCls({ cluster })
const cpusLength = os.cpus().length
if( cluster.isMaster && process.env.NODE_ENV !== 'TEST'  ) {
    for (let i = 0; i < cpusLength;  i++) masterWorker.upWorker()

    cluster.on('exit', worker => {
        // Loggear este pedo
        masterWorker.upDeadWorker()
    })
    
    /***** Tasks for update contributions data in 2 plain *****/
    require('./tasks/').realoadContributionsData()
} else {
    const app = express()
    
    /***** Middlewares *****/
    app.use(express.urlencoded({ extended: false }))
    app.use(bodyParser.json());
    
    /***** Routes *****/
    const routes = require('./routes/index')
    app.use(routes)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

    /***** Build server ******/
    const server = app.listen(PORT, HOST, () => {
        console.log(`Running in process - ${process.pid} @ on server - http://${HOST}:${PORT}`);
    });

    module.exports = { app, server }
}
