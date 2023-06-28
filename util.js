const moment = require('moment');

const dateFormat = (date = moment().add(12, 'hours'), format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
}

module.exports = {
  dateFormat,
  moment,
}