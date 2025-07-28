const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ...existing code...
    reportCount: {
        type: Number,
        default: 0
    }
    // ...existing code...
});

module.exports = mongoose.model('User', userSchema);