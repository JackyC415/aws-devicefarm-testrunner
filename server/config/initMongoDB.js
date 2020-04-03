const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/testrunner";

const options = {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true  
};

const initDB = async () => {
    
    try{
        await mongoose.connect(mongoURI,options);
        console.log('Connected to MongoDB!');
        
    }catch(error){
        console.log('Unable to connect to MongoDB!');
        console.log(error);
        process.exit(1);
    }
}

module.exports = initDB;