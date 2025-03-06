const { CronJob } = require('cron');

const job1 = new CronJob('* * * * *', ()=>{
    console.log('job 1 performed in 1 minute');
});

module.exports = job1;