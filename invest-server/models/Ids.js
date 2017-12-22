let mongoose = require('mongoose');

const idsSchema = new mongoose.Schema({
    userId: Number
});

const Ids = mongoose.model('Ids', idsSchema);

Ids.findOne((err, data) => {
    if (!data) {
        const newIds = new Ids({
            userId: 0,
        });
        newIds.save();
    }
});

module.exports = Ids;