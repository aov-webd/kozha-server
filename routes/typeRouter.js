const Router = require('express')
const router = new Router()
const typeController = require('../controllers/typeController')
const checkRole = require('../middleware/checkRoleMiddleware')


router.post('/', checkRole('ADMIN'), typeController.create)
router.post('/rm', checkRole('ADMIN'), typeController.remove)
router.get('/', typeController.getAll)

module.exports = router

