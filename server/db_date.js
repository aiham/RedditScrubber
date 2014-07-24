var padZero = function (n) {

  return (n < 10 ? '0' : '') + n;

};

module.exports = function (date) {

  var y = date.getFullYear(),
      mo = padZero(date.getMonth() + 1),
      d = padZero(date.getDate()),
      h = padZero(date.getHours()),
      mi = padZero(date.getMinutes()),
      s = padZero(date.getSeconds());

  return y + '-' + mo + '-' + d + ' ' + h + ':' + mi + ':' + s;

};
