const { Device, DeviceInfo } = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')

class DeviceController {
    async create(req, res, next) {
        try {
            let { name, price, brandId, typeId, description } = req.body
            let { img } = req.files
            let fileNames = []

            if (Array.isArray(img)) {
                img.forEach(image => {
                    let fileName = uuid.v4() + ".png"
                    fileNames.push(fileName)
                    image.mv(path.resolve(__dirname, '..', 'static', fileName))
                })
            } else {
                let fileName = uuid.v4() + ".png"
                fileNames.push(fileName)
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
            }

            const device = await Device.create({ name, price, description, brandId, typeId, img: fileNames })
            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        try {
            let { brandId, typeId, limit, page } = req.query
            page = page || 1
            limit = limit || 9
            let offset = page * limit - limit
            let devices;
            if (!brandId && !typeId) {
                devices = await Device.findAndCountAll({ limit, offset })
            }
            if (brandId && !typeId) {
                devices = await Device.findAndCountAll({ where: { brandId }, limit, offset })
            }
            if (!brandId && typeId) {
                devices = await Device.findAndCountAll({ where: { typeId }, limit, offset })
            }
            if (brandId && typeId) {
                devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset })
            }

            return res.json(devices)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params
            const device = await Device.findOne({
                where: { id }
            })
            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params
            const device = await Device.findOne({ where: { id } })
            if (device !== null) {
                for (let image of device.img) {
                    try {
                        fs.unlinkSync(path.resolve(__dirname, '..', 'static', image))
                    } catch (err) {
                        console.error(err)
                    }
                }
                await device.destroy();
            }
            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new DeviceController()
