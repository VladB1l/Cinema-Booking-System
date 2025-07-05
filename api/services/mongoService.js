const mongoose = require('mongoose');

mongoose.connect('mongodb://user123:password123@db-NoSql:27017/Cinema?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const ticketSchema = new mongoose.Schema({
    movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    show_date: { type: Date, required: true },
    show_time: { type: String, required: true },
    seat_number: { type: Number, required: true },
    movie_info: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
        title: { type: String, required: true },
        poster_url: { type: String, required: true }
    }
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    poster_url: { type: String},
}, { timestamps: true });


const Movie = mongoose.model('Movie', movieSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);

const getCollectionModel = (collectionName) => {
    if (mongoose.models[collectionName]) {
        return mongoose.models[collectionName];
    }
    const schema = new mongoose.Schema({}, { strict: false });
    return mongoose.model(collectionName, schema, collectionName);
};

const createDocument = async (collectionName, data) => {
    const Model = getCollectionModel(collectionName);
    const document = new Model(data);
    return await document.save();
};

const updateDocument = async (collectionName, id, data) => {
    const Model = getCollectionModel(collectionName);
    return await Model.findByIdAndUpdate(id, data, { new: true });
};

const deleteDocument = async (collectionName, id) => {
    const Model = getCollectionModel(collectionName);
    return await Model.findByIdAndDelete(id);
};

module.exports = {
    getCollectionModel,
    createDocument,
    updateDocument,
    deleteDocument,
    Ticket,
    Movie,
};
