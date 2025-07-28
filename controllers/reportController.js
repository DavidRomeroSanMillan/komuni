const User = require('../models/User');
const Report = require('../models/Report');

exports.createReport = async (req, res) => {
    try {
        const { description } = req.body;
        const userId = req.user.id; // Asumiendo que el id del usuario está en req.user

        // Crear el reporte con el id del usuario
        const report = await Report.create({
            description,
            userId
        });

        // Actualizar el contador de reportes del usuario
        await User.findByIdAndUpdate(userId, { $inc: { reportCount: 1 } });

        res.status(201).json({ message: 'Reporte creado', report });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el reporte', error });
    }
};