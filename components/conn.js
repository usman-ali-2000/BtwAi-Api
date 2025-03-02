const mongoose = require('mongoose');
mongoose.set('strictQuery', false);


async function checkConnection() {

  try {
   await mongoose.connect('mongodb+srv://btwai:qu6xIUKXRpiUVOuW@btwai.wr5u5.mongodb.net/?retryWrites=true&w=majority&appName=BtwAi');
    console.log('Connected to MongoDB');

    const state = mongoose.connection.readyState;
    console.log(`Connection state: ${state}`);

    
   
  } catch (error) {
    console.error(`Connection error: ${error.message}`);
    process.exit(1);  
}
   
}

process.on('uncaughtException', err => {
    console.error(`Uncaught exception: ${err}`);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled rejection at ${promise}, reason: ${reason}`);
    process.exit(1);
  });

checkConnection();