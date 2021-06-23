const router = require("express").Router();
const mainControllerCls = require('../controllers/mainController')
const mainController = new mainControllerCls()


/**
  * @swagger
  * tags:
  *   name: Contriescontributions
  *   description: The pulpomatic-backent-test API
*/

/**
 * @swagger
 * /contriesContributions:
 *   post:
 *      summary: Creates a new user.
 *      tags: [Contries contributions]
 *      consumes:
 *          - application/json
 *      parameters:
 *          - in: body
 *            name: countryCode
 *            description: Code of country to search.
 *            schema:
 *              type: string
 *              default: "MX"
 *              required:
 *                  - countryCode
 *          - in: body
 *            name: year
 *            description: Year to search.
 *            schema:
 *              type: string
 *              default: "2021"
 *              required:
 *                  - year
 *      responses:
 *       200:
 *         
 */
router.route("/contriesContributions").post(async (req, res) => await mainController.extractData(req, res));


module.exports = router