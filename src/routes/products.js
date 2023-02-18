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
        let { name, imagen, stock, stockDeposito, price, priceBuy, avaible, categoryNames, group } = req.body  // obtenemos los valores
        if (name && (stock !== null) && (stockDeposito !== null) && price && priceBuy && (avaible !== null)) { // verificamos
            let objeto = {
                name,
                imagen,
                stock,
                stockDeposito,
                price,
                avaible,
                priceBuy,
                // agrego categoryNames si esta unicamente
                categoryNames: categoryNames ? categoryNames : '',
                group: group ? group : ''
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

// creo una ruta /list donde hare post igual que arriba pero de varios productos
router.post('/list', async (req, res) => {
    try {
        let { productos } = req.body
        if (productos) {
            let respuesta = await Promise.all(productos.map(async el => {
                let { name, imagen, stock, stockDeposito, price, priceBuy, avaible, categoryNames, group } = el  // obtenemos los valores
                if (name && (stock !== null) && (stockDeposito !== null) && price && priceBuy && (avaible !== null) && categoryNames) { // verificamos
                    let objeto = {
                        name,
                        imagen,
                        stock,
                        stockDeposito,
                        price,
                        avaible,
                        priceBuy,
                        categoryNames,
                        group: group ? group : ''
                    }
                    // establecemos la imagen
                    if (!objeto.imagen.length) objeto.imagen = "https://media.istockphoto.com/id/1320642367/vector/image-unavailable-icon.jpg?s=170667a&w=0&k=20&c=f3NHgpLXNEkXvbdF1CDiK4aChLtcfTrU3lnicaKsUbk="
                    // revisamos si existe
                    let existencia = await Product.findAll({ where: { name: objeto.name.toLowerCase() } })
                    if (!existencia.length) {
                        let respuesta = await Product.create(objeto) // creamos el producto
                        return respuesta
                    } else {
                        throw new Error('That product already exist')
                    }
                } else {
                    throw new Error('The info provided is not enough');
                }
            }))
            // enviamos la respuesta
            return res.json(respuesta)
        } else {
            throw new Error('The info provided is not enough');
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// creo una ruta post para postear un array que tiene un grupo grande de arrays con los datos de cada producto, la estructura del array es la siguiente "[Clave,Unidad,Nombre,Cantidad,Costo,Precio,Cantidad Mínima,Precios Adicionales,Información Adicional,Categoría,Costo Promedio,]" donde array[2] equivale a "name", array[3] equivale a "stockDeposito", array[4] equivale a "priceBuy", array[5] equivale a "price" y array[9] equivale a "categoryNames", adicionalmente la propiedad "imagen" se establecera en una imagen por defecto que es "https://media.istockphoto.com/id/1320642367/vector/image-unavailable-icon.jpg?s=170667a&w=0&k=20&c=f3NHgpLXNEkXvbdF1CDiK4aChLtcfTrU3lnicaKsUbk=" y por ultimo se recibira un segundo array con la misma estructura donde si el nombre coincide exactamente a algun elemento del primer array entonces se tomara el valor de "Cantidad" y se establecera en la propiedad "stock" de ese producto
router.post('/miNegocio', async (req, res) => {
    try {
        let { productos, productosStock } = req.body
        if (productos && productosStock) {
            let respuesta = await Promise.all(productos.map(async el => {
                el = el.split(',')
                // reviso si la length del array es igual a 10, si no lo es entonces inserto un elemento vacio en la posicion 1, por ejemplo si el array es asi ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] entonces lo convierto en ['a', '', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] para que la posicion 1 sea la unidad y la posicion 2 sea el nombre
                if (el.length < 10) el.splice(1, 0, '')
                let name = el[2]
                let stockDeposito = el[3]

                // reviso si en productosStock existe un producto con el mismo nombre al revisar el array pero aplicando .split(',') a cada string que vino dentro del array antes, entonces si se consigue coincidencia la variable stock le doy el valor de array[3] de ese producto, si no existe la coincidencia entonces stock sera igual a 0
                let stock = productosStock.find(el => el.split(',')[2] === name) ? productosStock.find(el => el.split(',')[2] === name).split(',')[3] : 0

                let priceBuy = el[4]
                let price = el[5]
                let categoryNames = el[9]
                let imagen = "https://media.istockphoto.com/id/1320642367/vector/image-unavailable-icon.jpg?s=170667a&w=0&k=20&c=f3NHgpLXNEkXvbdF1CDiK4aChLtcfTrU3lnicaKsUbk="
                avaible = true;

                if (!categoryNames) categoryNames = "Sin categoría"

                // reviso si stockDeposito, stock, priceBuy o price llevado a Number() es negativo o NaN, si es asi entonces le doy el valor de 0 y si no los guardo pero convertidos a Number()
                stockDeposito = (Number(stockDeposito) < 0 || isNaN(Number(stockDeposito))) ? 0 : Number(stockDeposito)
                stock = (Number(stock) < 0 || isNaN(Number(stock))) ? 0 : Number(stock)
                priceBuy = (Number(priceBuy) < 0 || isNaN(Number(priceBuy))) ? 0 : Number(priceBuy)
                price = (Number(price) < 0 || isNaN(Number(price))) ? 0 : Number(price)

                // reviso si stock o stockDeposito son numeros float, de ser asi los redondeo al mas alto y los convierto en integer
                stockDeposito = (stockDeposito % 1 !== 0) ? Math.ceil(stockDeposito) : stockDeposito
                stock = (stock % 1 !== 0) ? Math.ceil(stock) : stock

                if (name && (stockDeposito !== null) && (priceBuy !== null) && (price !== null) && (categoryNames !== null)) { // verificamos
                    let objeto = {
                        name,
                        imagen,
                        stock,
                        stockDeposito,
                        price,
                        priceBuy,
                        categoryNames,
                        group: '',
                        imagen,
                        avaible
                    }
                    // revisamos si existe
                    let existencia = await Product.findAll({ where: { name: objeto.name.toLowerCase() } })
                    if (!existencia.length) {
                        let respuesta = await Product.create(objeto) // creamos el producto
                        return respuesta
                    } else {
                        throw new Error('That product already exist')
                    }
                } else {
                    console.log('falla en: ', name)
                    throw new Error('The info provided is not enough in one product');
                }
            }))
            // enviamos la respuesta
            return res.json(respuesta)
        } else {
            throw new Error('The info provided is not enough in the two main arrays');
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})



// rutas put

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
                    let productoActual = await producto.find(el => el.id == id)
                    // edito el producto dentro de la variable producto usando su id
                    productoActual.name = cambio.name
                    productoActual.imagen = cambio.imagen
                    productoActual.stock = Number(cambio.stock)
                    productoActual.stockDeposito = cambio.stockDeposito
                    productoActual.price = cambio.price
                    productoActual.priceBuy = cambio.priceBuy
                    productoActual.avaible = cambio.avaible
                    productoActual.categoryNames = cambio.categoryNames
                    productoActual.group = cambio.group
                    // reemplazo el producto con la id elegida con lo que ahora tengo en productoActual re escribiendo el array
                    producto = producto.map(el => el.id === Number(id) ? productoActual : el)
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


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { name, imagen, stock, stockDeposito, price, priceBuy, avaible, categoryNames, group } = req.body
        let producto = await Product.findByPk(id)
        if (name) producto.name = name
        if (imagen) producto.imagen = imagen
        if (stock !== null) producto.stock = stock
        if (stockDeposito !== null) producto.stockDeposito = stockDeposito
        if (price) producto.price = price
        if (priceBuy) producto.priceBuy = priceBuy
        if (avaible) producto.avaible = avaible
        if (categoryNames) producto.categoryNames = categoryNames
        if (group) producto.group = group

        await producto.save();
        res.json(producto);
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