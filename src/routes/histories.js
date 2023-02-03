const { Router } = require('express');
const router = Router();
const { History } = require('../db')
require('dotenv').config();



// rutas get
router.get('/', async (req, res) => {
    try {
        const histories = await History.findAll();
        res.json(histories);
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// creo un get por id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const history = await History.findByPk(id);
        res.json(history)
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// rutas post

// creo una ruta post
router.post('/', async (req, res) => {
    try {
        // Antes de crear el producto reviso si la cantidad de elementos en History es menor o igual a 500, si es mayor entonces elimino el objeto mas viejo y lo reemplazo por el nuevo
        const { products, date, status } = req.body
        if (products && date && status) {
            // date debe ser con este formato = 2022-12-31T23:59:59.000Z
            const histories = await History.findAll();
            if (histories.length >= 500) {
                await History.destroy({
                    where: {
                        id: histories[0].id
                    }
                })
            }
            const history = await History.create({
                products,
                date,
                status
            })
            res.json(history)            
        } else
            return res.status(400).json({ message: 'Bad request' })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// rutas put
// creo una ruta put donde se mantiene todo el historial pero se edita el status al que no esta activado, si esta complete cambia a cancelled y viceversa
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const history = await History.findByPk(id);
        if (history.status === 'complete') {
            await History.update({
                status: 'cancelled'
            }, {
                where: {
                    id
                }
            })
        } else {
            await History.update({
                status: 'complete'
            }, {
                where: {
                    id
                }
            })
        }
        res.json(history)
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// ruta delete
// creo una ruta delete donde se elimina el historial
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await History.destroy({
            where: {
                id
            }
        })
        res.json({ message: 'History deleted' })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

module.exports = router;