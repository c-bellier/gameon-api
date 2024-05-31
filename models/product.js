const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    brand: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    reference: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        enum: ['child', 'junior', 'senior']
    },
    sizeChart: {
        type: [String],
        required: true,
    },
    supplier: {
        type: {
            name: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            }
        },
        required: true,
    },
    sectionId: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
