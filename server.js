//start server
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//handling uncaughtException using event listner
process.on('uncaughtException', (err) => {
  console.log('uncaughtException shuting down ...');
  console.log(err.name, err.message);
  process.exit(1); //uncaught exception if its 1 , if its 0 its success
});

//env file
dotenv.config({ path: './config.env' });

//
const app = require('./app');

//
const db = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('Db connected succesfully');
  });

//environment variable
//console.log(app.get('env')); //express by default starts in development environment

//
//console.log(process.env); // node env

//server port & listen
const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`listening on the port ${port} ....`);
});

//handling unhandled rejection using event listner
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLKED REJECTION  shuting down ...');
  server.close(() => {
    process.exit(1); //uncaught exception if its 1 , if its 0 its success
  });
});
