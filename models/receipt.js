const mongoose = require('mongoose');
const { Schema } = mongoose;

const receiptSchema = new Schema({
    reference: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    products: {
        type: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be greater than 0']
            }
        }],
        required: true,
    },
    customer: { 
        type: {
            name: {
                type: String,
                required: true,
            },
            email: String,
            address: String,
            phone: String
        },
        required: true
    }
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
