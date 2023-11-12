const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logSchema = new Schema({
    date: {
        type: Date,
        required: true,
    },
})
 
module.exports = mongoose.model("Log", logSchema);