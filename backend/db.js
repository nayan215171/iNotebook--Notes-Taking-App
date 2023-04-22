const mongoose = require('mongoose')
const mongoURI =  "mongodb+srv://nayan2552:KsvFmtHdeHKMZvfq@cluster1.4pgxreo.mongodb.net/inotebook?retryWrites=true&w=majority"

const connectToMongo = () => {
    mongoose.connect(mongoURI).then(()=> console.log("Connected!"))
}

module.exports = connectToMongo