// importamos app
const {
    app, 
    // conn
} = require('./src/app.js');

const port = process.env.PORT || 3000

// conn.sync({ force: false }).then(() => {
//     app.listen(port, '0.0.0.0')
//     console.log('Server listening on port ' + port)
// })

app.listen(port, '0.0.0.0')
console.log('Server listening on port ' + port)