## Pulpomtic-backend-test

### Running the development environment

* `make up`
* `npm run dev`

### Running unit tests
* `make up`
* `npm run test`

##### Rebuilding the base Docker image
* `make rebuild`

## Hostnames for accessing the service directly

* Local: http://127.0.0.1:3000
* Api-Documentation http://127.0.0.1:3000/api-docs/
* CollectionEndpoints For *Insomnia* & *Postman* `./pulpomatic_backend_test.json`
--- 

# Introducción
**Pulpomatic backend test by Kevin Cruces**
Email: kevincruces.zuloaga@gmail.com

## Forma de operar
* La aplicación hace un llamado a la api `https://iatidatastore.iatistandard.org` para retornar en años las organizaciones que donaron de mayor a menor cantidad.
--
* Inicialmente al montar el contenedor de docker, en las instrucciones se ejecuta el comando `npm run load` para correr los scripts que se encargan de precargar la información del sistema, en este caso; la lista de países.
--
* La aplicación está clusterizada, es decir; tendrá `n` número de hilos ó procesos, dependiendo los recursos de la máquina anfitriona
--
* La primera ejecución de la API, el sistema hace la respectiva extracción y procesamiento de datos, para guardarla en un base de datos creada con archivos json, librería utilizada `https://www.npmjs.com/package/lowdb`
--
* La segunda ejecución de la API, se encarga de primero verificar si tenemos almacenados contribuciones que cuente con el código de país y rango de fechas que recibimos en el request, si ya tenemos la información, el sistema responderá con la respuesta solicitada desde nuestra pequeña base de datos temporal, si no contamos con los datos, la información será nuevamente extráida de la API
--
* Hay tareas asíncronas que se ejecutan en la madrugada, se fraccionan el número total de países en 10, y éstos se actualizan cada 5 minutos desde las 4:00am, esto con la finalidad de tener actualizados los datos al día.

### Procesos
1.- Primer llamado por país / **3 - 5 seg**
2.- Llamados posteriores / **4 - 20ms**

### Endpoint principal
| URL | Descripción |
| ----------- | ----------- |
| http://127.0.0.1:3000/contriesContributions | `OK` |
| 200 | `JSON` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `ERROR DE SERVIDOR INTERNO` |

### Response
 `{
*      "2016": {
        "Global Environment Facility": 4372477,
        "Food and Agriculture Organization (FAO)": 34173.25,
        "The Joint United Nations Programme on HIV and AIDS (UNAIDS) Secretariat": 1000,
        "Federal Ministry for Economic Cooperation and Development": 250
      },
      "2017": {
        "Cross-Government Prosperity Fund": 75838786.27,
        "United Nations High Commissioner for Refugees (UNHCR)": 100000.04,
        "United Nations Industrial Development Organization (UNIDO)": 6000.93,
        "Oxfam America": 0
      },
      "2018": {
        "United Nations Development Coordination Office": 281190900,
        "Federal Ministry for Economic Cooperation and Development": 34343452.87,
        "United States": 50000,
        "United Nations Population Fund": 200.74,
        "UK - Department for International Development (DFID)": 0
      },
      "2019": {
        "United Nations High Commissioner for Refugees (UNHCR)": 60565517.69,
        "Federal Ministry for Economic Cooperation and Development": 60000.24,
        "The Joint United Nations Programme on HIV and AIDS (UNAIDS) Secretariat": 12000,
        "Prince Claus Fund": 500.08
      },
      "2020": {
        "European Commission - Service for Foreign Policy Instruments": 1000000,
        "United Nations Office for Project Services (UNOPS)": 485000,
        "IDOM INGENIERIA, S.A. de C.V.": 20242.15,
        "United States": 12000,
        "Oxfam GB": 7447,
        "Bill & Melinda Gates Foundation": 0
      },
      "2021": {
        "United Nations Development Programme (UNDP)": 28779,
        "SECOURS CATHOLIQUE - CARITAS FRANCE": 83788.36,
        "World Health Organization": 3206.5,
        "European Investment Bank": 200,
        "UN Women": 0
      },
      "countryId": "720375b7-f2ca-47a2-b053-decb0a6c2f94",
      "id": "44bc144c-2112-4983-aa69-699a9a04f5db"
    }`
### Códigos de estado

**Pulpomatic backend test** devuelve los siguientes códigos de estado en su API:

| Código de estado | Descripción |
| ----------- | ----------- |
| 200 | `OK` |
| 201 | `CREATED` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `ERROR DE SERVIDOR INTERNO` |

----