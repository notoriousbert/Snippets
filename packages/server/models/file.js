import mongoose from "mongoose";


const fileSchema = new mongoose.Schema({
    meta_data:{}
});

const File = mongoose.model("File",fileSchema);

export default File