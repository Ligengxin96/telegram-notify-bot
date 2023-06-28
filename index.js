const CronJob = require('cron').CronJob;
const fs = require('fs');
const promisfy = require('util').promisify;
const exec = promisfy(require('child_process').exec);

const { dateFormat, moment } = require('./util');
const { getWeatherReport, checkIn, checkOut } = require('./script');

new CronJob('00 00 08,18 * * *', getWeatherReport, null, true, 'Asia/Shanghai');

new CronJob('00 15 11 * * *', getWeatherReport, null, true, 'Asia/Shanghai');

const checkInJob = new CronJob('00 25 09 * * 1-5', checkIn, null, true, 'Asia/Shanghai');

const checkOutJob = new CronJob('00 30 18 * * 1-5', checkOut, null, true, 'Asia/Shanghai');

const getHolidayData = async (redoCount = 0) => {
  if (redoCount > 3) {
    return;
  }
  try {
    await exec(`curl -O https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2023.json`);
  } catch (error) {
    console.error(dateFormat(), error);
    return getHolidayData(++redoCount);
  }
}

setInterval(async () => {
  const todayDate = dateFormat(moment(), 'YYYY-MM-DD');
  const thisYear = moment().year();
  const holidayFile = `./${thisYear}.json`;
  if (fs.existsSync(holidayFile)) {
    const holidayData = fs.readFileSync(holidayFile, 'utf-8');
    const { days } = JSON.parse(holidayData);
    const isHoliday = days.find(day => day.date === todayDate);
    if (isHoliday && isHoliday.isOffDay) {
      checkInJob.stop();
      checkOutJob.stop();
    } else {
      checkInJob.start();
      checkOutJob.start();
    }
  } else {
    getHolidayData();
  }
}, 1000 * 60 * 15);


console.log(dateFormat(), 'Bot is Started');
