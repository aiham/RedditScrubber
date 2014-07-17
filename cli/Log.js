var Log = function (debug, prefix) {

  this.debug = !!debug;
  this.prefix = prefix || 'Log';
  this.messages = [];

};

Log.prototype = {

  constructor: Log,

  add: function (message) {

    if (this.debug) {
      this.print(message);
    } else {
      this.messages.push(message);
    }

  },

  print: function (message) {

    console.log(this.prefix + ': ' + message);

  },

  printAll: function () {

    var i, l;
    for (i = 0, l = this.messages.length; i < l; i++) {
      this.print(this.messages[i]);
    }

  },

  reset: function () {

    this.messages = [];

  }

};

module.exports = new Log();
