const mongoose = require('mongoose');

const URL = process.env.MONGO_DB_REMOTE;
const APP_NAME = process.env.APP_NAME;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
  // useFindAndModify: false,
  // useCreateIndex: true,
};
mongoose.Promise = global.Promise;
const connectDB = async () => {
  await mongoose.connect(URL, options);
  console.log(
    '------------------------------------------------------------------------------------------------------'
  );
  console.log(`Establishing connection for database: ${APP_NAME} || with URL ${URL}`);
};

module.exports = connectDB;
