const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // ...existing code...
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // ...existing code...
});

module.exports = mongoose.model('Report', reportSchema);