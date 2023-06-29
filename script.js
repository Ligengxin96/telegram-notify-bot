const TelegramBot = require('node-telegram-bot-api');
const promisfy = require('util').promisify;
const exec = promisfy(require('child_process').exec);


const { dateFormat } = require('./util');
const { TOKEN, PROXY, AUTH_USER_ID } = require('./config');

const bot = new TelegramBot(TOKEN, {
  polling: false,
  request: {
    proxy: PROXY || null,
  },
});

const location = "深圳市南山区";
const weatherImage = `./${location}.png`;

const getWeatherData = async (redoCount = 0) => {
  if (redoCount > 3) {
    return {};
  }

  try {
    await exec(`curl -H "Accept-Language: zh-CN" "https://wttr.in/${location}_m1.png" --output ${weatherImage}`);
    console.log(dateFormat(), `获取天气图片成功.`);

    const { stdout } = await exec(`curl -H "Accept-Language: zh-CN" "https://wttr.in/${location}?m1&format=j1"`);
    console.log(dateFormat(), `获取天气json数据成功.`);

    const weatherData = JSON.parse(stdout);
    const weatherDesc = weatherData?.current_condition[0]?.lang_zh[0]?.value;
    const maxtempC = weatherData?.weather[0]?.maxtempC;
    const mintempC = weatherData?.weather[0]?.mintempC;
    console.log(dateFormat(), `发送天气数据成功.`)
    return { weatherDesc, maxtempC, mintempC, weatherData };
  } catch (error) {
    console.error(dateFormat(), error);
    return getWeatherData(++redoCount);
  }
}

const getWeatherReport = async () => {
  const { weatherDesc, maxtempC, mintempC } = await getWeatherData();
  if (!weatherDesc || !maxtempC || !mintempC) {
    bot.sendMessage(AUTH_USER_ID, '获取天气失败.');
    return;
  } else {
    bot.sendMessage(AUTH_USER_ID, `现在是 ${dateFormat()}\n今天${location}:${weatherDesc}\n最高温度: ${maxtempC} 度, 最低温度: ${mintempC} 度`);
    bot.sendPhoto(AUTH_USER_ID, weatherImage);
  }
}

const checkIn = async () => {
  bot.sendMessage(AUTH_USER_ID, `现在是 ${dateFormat()}\n记得上班打卡哦`);
}

const specialCheckIn = async () => {
  bot.sendMessage(AUTH_USER_ID, `现在是 ${dateFormat()}\n今天调休,记得去上班哦`);
}

const checkOut = async () => {
  bot.sendMessage(AUTH_USER_ID, `现在是 ${dateFormat()}\n记得下班打卡哦`);
}

module.exports = {
  getWeatherReport,
  checkIn,
  checkOut,
  specialCheckIn,
};