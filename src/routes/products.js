const { Router } = require('express');
const router = Router();
const { Product, Category } = require('../db')
require('dotenv').config();



// rutas get
router.get('/', async (req, res) => {
    try {
        // let productos = await Product.findAll({ include: Category });

        // guardo una lista de todos los elementos de Product incluyendo los elementos de Category asociados a el mismo
        let productos = await Product.findAll({ include: Category });
        return res.json(productos)
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params
        let productos = await Product.findAll({ where: { id: id }, include: Category });
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
                priceBuy
            }
            // establecemos la imagen
            if (!objeto.imagen.length) objeto.imagen = "https://media.istockphoto.com/id/1320642367/vector/image-unavailable-icon.jpg?s=170667a&w=0&k=20&c=f3NHgpLXNEkXvbdF1CDiK4aChLtcfTrU3lnicaKsUbk="
            // revisamos si existe
            let existencia = await Product.findAll({ where: { name: objeto.name.toLowerCase() } })
            if (!existencia.length) {
                let respuesta = await Product.create(objeto)

                // si la variable categoryNames no es un array vacio entonces deben eliminarse las categorias actuales del producto y agregarse las nuevas, si las nuevas ya existen entonces utilizar esa categoria, de lo contrario crearla dentro del modelo categories y luego agregarla al producto
                if (categoryNames.length) {
                    // agregamos las nuevas categorias
                    categoryNames.map(async category => {
                        category = category.toUpperCase()
                        let categoryEl = await Category.findOne({ where: { name: category } })
                        if (categoryEl) {
                            objeto.addCategory(categoryEl, { through: 'Product_Category' })
                        } else {
                            let newCategory = await Category.create({ name: category })
                            objeto.addCategory(newCategory, { through: 'Product_Category' })
                        }
                    })
                }


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
        const producto = await Product.findByPk(id, { include: Category })
        if (name) producto.name = name
        if (imagen) producto.imagen = imagen
        if (stock !== null) producto.stock = stock
        if (stockDeposito !== null) producto.stockDeposito = stockDeposito
        if (price) producto.price = price
        if (priceBuy) producto.priceBuy = priceBuy
        if (avaible) producto.avaible = avaible

        // si la variable categoryNames no es un array vacio entonces deben eliminarse las categorias actuales del producto y agregarse las nuevas, si las nuevas ya existen entonces utilizar esa categoria, de lo contrario crearla dentro del modelo categories y luego agregarla al producto
        if (categoryNames.length) {
            // eliminamos las categorias actuales del producto
            producto.Categories.map(async p => {
                await producto.removeCategories(p);
            })
            // agregamos las nuevas categorias
            categoryNames.map(async category => {
                category = category.toUpperCase()
                let categoryEl = await Category.findOne({ where: { name: category } })
                if (categoryEl) {
                    producto.addCategory(categoryEl, { through: 'Product_Category' })
                } else {
                    let newCategory = await Category.create({ name: category })
                    producto.addCategory(newCategory, { through: 'Product_Category' })
                }
            })
        }

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