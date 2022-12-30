const { Router } = require('express');
const router = Router();
const { Category } = require('../db')
require('dotenv').config();



// rutas get
router.get('/', async (req, res) => {
    try {
        let categorias = await Category.findAll();
        return res.json(categorias)
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// express route type get
// return one element with specific id
router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params
        let categoria = await Category.findByPk(id)
        if (categoria) {
            return res.json(categoria)
        }
        else {
            throw new Error('The category does not exist');
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})




// rutas post
router.post('/', async (req, res) => {
    try {
        let { arr } = req.body
        if (arr) {
            arr.map(async (el) => {
                    el = el.toUpperCase(); // para ponerlo en Mayuscula
                    let objeto = {
                        name: el
                    }
                    let existencia = await Category.findAll({ where: objeto })
                    if (!existencia.length) {
                        await Category.create(objeto)
                    } else {
                        console.log('at least one product is already in the Database')
                    }
            })
            return res.json('Categories recieved')
        }
        else {
            throw new Error('The info provided is not enough');
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
)


module.exports = router;