const { Router } = require('express');
const router = Router();
const { Product } = require('../db')
require('dotenv').config();



// rutas get
router.get('/', async (req, res) => {
    try {

        let productos = await Product.findAll();
        return res.json(productos)
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params
        let productos = await Product.findAll({ where: { id } });
        return res.json(productos)
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// rutas post
router.post('/', async (req, res) => {
    try {
        let { name, imagen, stock, stockDeposito, price, priceBuy, avaible, categoryNames } = req.body  // obtenemos los valores
        if (name && (stock !== null) && (stockDeposito !== null) && price && priceBuy && (avaible !== null) && categoryNames) { // verificamos
            let objeto = {
                name,
                imagen,
                stock,
                stockDeposito,
                price,
                avaible,
                priceBuy,
                categoryNames
            }
            // establecemos la imagen
            if (!objeto.imagen.length) objeto.imagen = "https://media.istockphoto.com/id/1320642367/vector/image-unavailable-icon.jpg?s=170667a&w=0&k=20&c=f3NHgpLXNEkXvbdF1CDiK4aChLtcfTrU3lnicaKsUbk="
            // revisamos si existe
            let existencia = await Product.findAll({ where: { name: objeto.name.toLowerCase() } })
            if (!existencia.length) {
                let respuesta = await Product.create(objeto) // creamos el producto

                // enviamos la respuesta
                return res.json(respuesta)
            } else {
                throw new Error('That product already exist')
            }
        } else {
            throw new Error('The info provided is not enough');
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// rutas put

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { name, imagen, stock, stockDeposito, price, priceBuy, avaible, categoryNames } = req.body
        let producto = await Product.findByPk(id)
        if (name) producto.name = name
        if (imagen) producto.imagen = imagen
        if (stock !== null) producto.stock = stock
        if (stockDeposito !== null) producto.stockDeposito = stockDeposito
        if (price) producto.price = price
        if (priceBuy) producto.priceBuy = priceBuy
        if (avaible) producto.avaible = avaible
        if (categoryNames) producto.categoryNames = categoryNames

        await producto.save();
        res.json(producto);
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// creo una ruta put que funcione igual a la ya existente pero en lugar de recibir una id recibira un array de id's y aplicara las modificaciones a cada uno de los productos con esas id, ademas las propiedades que deben ser modificadas vendran en un array llamado cambios en el cual habran objetos con los datos para cada producto
router.put('/array', async (req, res) => {
    try {
        let { ids, cambios } = req.body
        if (ids && cambios) {
            if (ids.length === cambios.length) {
                let producto = await Product.findAll()
                for (let i = 0; i < ids.length; i++) {
                    let id = ids[i]
                    let cambio = cambios[i]
                    // obtengo el producto que tiene la id de turno y lo guardo en una variable
                    let productoActual = producto.find(el => el.id === id)
                    // edito el producto dentro de la variable producto usando su id
                    productoActual.name = cambio.name
                    productoActual.imagen = cambio.imagen
                    productoActual.stock = cambio.stock
                    productoActual.stockDeposito = cambio.stockDeposito
                    productoActual.price = cambio.price
                    productoActual.priceBuy = cambio.priceBuy
                    productoActual.avaible = cambio.avaible
                    productoActual.categoryNames = cambio.categoryNames
                    // reemplazo el producto con la id elegida con lo que ahora tengo en productoActual re escribiendo el array
                    producto = producto.map(el => el.id === id ? productoActal : el)
                }
                // guardo los cambios en producto
                await Promise.all(producto.map(async el => await el.save()))
                res.json(producto)
            } else {
                throw new Error('The arrays must have the same length')
            }
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// ruta delete para eliminar un producto por id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Product.findByPk(id);
        await producto.destroy();
        res.json({ message: 'Product deleted' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

module.exports = router;