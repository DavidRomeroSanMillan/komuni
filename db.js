const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    });

module.exports = mongoose;