const { Type, Device } = require('../models/models')
const ApiError = require('../error/ApiError')
const fs = require('fs')
const path = require('path')

class TypeController {
    async create(req, res, next) {
        try {
            const { name } = req.body
            const type = await Type.create({ name })
            return res.json(type)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async remove(req, res, next) {
        try {
            const { name, id } = req.body
            const type = await Type.findOne({ where: { id } })
            console.log(type)
            let devices = await Device.findAndCountAll({ where: { typeId: id } })
            console.log(devices.rows)
            for (let device of devices.rows) {
                for (let image of device.img) {
                    try {
                        console.log(image)
                        fs.unlinkSync(path.resolve(__dirname, '..', 'static', image))
                    } catch (err) {
                        console.error(err)
                    }
                }
                await device.destroy();
            };
            await type.destroy();
            return res.json(type)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const types = await Type.findAll()
            return res.json(types)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new TypeController()
