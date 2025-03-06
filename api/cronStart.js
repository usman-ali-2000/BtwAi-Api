const job1 = require('./cron');

const startJob = () => {
    job1.start();
}

module.exports = startJob;