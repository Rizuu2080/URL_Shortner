const mongoose = require('mongoose');

async function connect(url) {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

module.exports = {connect};