var Callback = function (method, context) {
  this.method = method;
  this.context = context;
};

Callback.prototype = {

  constructor: Callback,

  call: function () {

    if (typeof this.method === 'function') {
      this.method.apply(this.context || null, arguments);
    }

  }

};

module.exports = Callback;
