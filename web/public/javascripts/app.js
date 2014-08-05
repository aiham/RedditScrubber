// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

(function () {

  var Server = function () {

    this.apiPath = '/api/';

  };

  Server.prototype = {

    constructor: Server,

    status: function (success, fail) {

      $.get(this.apiPath + 'status', function (data) {

        if (data.user) {
          success(data.user, data.task);
        } else {
          fail('auth');
        }

      });

    },

    update: function (type, success, fail) {

      $.post(this.apiPath + 'update', {type: type}, function (data) {

        if (!data.user) {
          fail('auth');
          return;
        }

        if (!data.success) {
          console.log(data.error);
          fail('internal');
          return;
        }

        success(data.user, data.task);

      });

    },

    authOut: function (success, fail) {

      $.post(this.apiPath + 'auth/out', function (data) {

        success();

      });

    }

  };

  var View = function () {

    this.$elipses = null;
    this.elipsesCounter = 0;

  };

  View.prototype = {

    constructor: View,

    bindEvents: function (delegate) {

      $('#navSignOut').click(function (e) {

        e.preventDefault();
        delegate.signOut();

      });

      $('#navAbout').click(function (e) {

        e.preventDefault();
        delegate.about();

      });

      $('#navTitle').click(function (e) {

        e.preventDefault();
        delegate.home();

      });

      $('#rowOptions a').click(function (e) {

        e.preventDefault();
        delegate.updateTask($(this).text().toLowerCase());

      });

      $('#rowWaiting a, #rowDeleting a').click(function (e) {

        e.preventDefault();
        delegate.cancelTask();

      });

    },

    animateElipses: function () {

      if (!this.$elipses) {
        this.$elipses = $('.elipses');
      }

      if (this.elipsesCounter > 3) {
        this.elipsesCounter = 0;
      }

      this.$elipses.html(
        this.elipsesCounter > 2 ? '...' :
          (this.elipsesCounter > 1 ? '..&nbsp;' :
            (this.elipsesCounter > 0 ? '.&nbsp;&nbsp;' :
              '&nbsp;&nbsp;&nbsp;'))
      );
      this.elipsesCounter++;

      var that = this;
      setTimeout(function () {

        that.animateElipses();

      }, 400);

    },

    toggleTagDisplay: function (selector, show) {

      $(selector)[show ? 'removeClass' : 'addClass']('hide');

    },

    hideMainSections: function () {

      $('.mainSection').addClass('hide');

    },

    showLoading: function () {

      this.hideMainSections();
      this.toggleTagDisplay('#rowLoading', true);

    },

    showAbout: function () {

      this.hideMainSections();
      this.toggleTagDisplay('#rowAbout', true);

    },

    showSignIn: function () {

      this.hideMainSections();
      this.toggleTagDisplay('#rowSignIn', true);

    },

    showProfile: function (user) {

      this.hideMainSections();
      this.toggleTagDisplay('#rowProfile', true);
      var url = 'http://www.reddit.com/user/' + user.username;
      $('#redditName').text(user.username).attr('href', url);
      $('#postsDeleted').text(user.posts_deleted);
      $('#commentsDeleted').text(user.comments_deleted);

    },

    hideInnerSections: function () {

      $('.innerSection').addClass('hide');

    },

    showIdle: function () {

      this.hideInnerSections();
      this.toggleTagDisplay('#rowIdle', true);
      this.toggleTagDisplay('#rowOptions', true);

    },

    showWaiting: function (type, time) {

      this.hideInnerSections();
      this.toggleTagDisplay('#rowWaiting', true);
      $('#rowWaiting .time').text(time);
      $('#rowWaiting .plural')[time === 1 ? 'hide' : 'show']();

      var typeText = '';
      if (type === 'all') {
        typeText = '<strong>Posts</strong> and <strong>Comments</strong>';
      } else if (type === 'posts') {
        typeText = '<strong>Posts</strong>';
      } else if (type === 'comments') {
        typeText = '<strong>Comments</strong>';
      } else {
        //TODO
        console.log('Invalid type: ' + type);
      }
      $('#rowWaiting .types').html(typeText);

    },

    showDeleting: function (type, time) {

      this.hideInnerSections();
      this.toggleTagDisplay('#rowDeleting', true);
      $('#rowDeleting .time').text(time);
      $('#rowDeleting .plural')[time === 1 ? 'hide' : 'show']();

      var typeText = '';
      if (type === 'all') {
        typeText = '<strong>Posts</strong> and <strong>Comments</strong>';
      } else if (type === 'posts') {
        typeText = '<strong>Posts</strong>';
      } else if (type === 'comments') {
        typeText = '<strong>Comments</strong>';
      } else {
        //TODO
        console.log('Invalid type: ' + type);
      }
      $('#rowDeleting .types').html(typeText);

    },

    updateAuthButton: function (user) {

      if (user) {
        this.toggleTagDisplay('#navSignIn', false);
        this.toggleTagDisplay('#navSignOut', true);
      } else {
        this.toggleTagDisplay('#navSignIn', true);
        this.toggleTagDisplay('#navSignOut', false);
      }

    }

  };

  var App = function () {

    this.server = new Server();
    this.view = new View();

  };

  App.prototype = {

    constructor: App,

    begin: function () {

      this.view.bindEvents(this);
      this.view.animateElipses();
      this.view.showLoading();
      this.refreshStatus();

    },

    minutesSince: function (dateString) {

      var since = new Date(dateString);
      var now = new Date();
      var minutes = (now.getTime() - since.getTime()) / 1000 / 60;
      return Math.floor(minutes);

    },

    updateView: function (user, task) {

      if (user) {
        this.view.updateAuthButton(user);
        this.view.showProfile(user);
        if (task && task.status !== 'complete' && task.status !== 'canceled') {
          if (task.status === 'queued') {
            this.view.showWaiting(task.type, this.minutesSince(task.createdAt));
          } else if (task.status = 'wiping') {
            this.view.showDeleting(task.type, this.minutesSince(task.wipe_start));
          } else {
            // TODO
            console.log('Invalid task status: ' + task.status);
          }
        } else {
          this.view.showIdle();
        }
      } else {
        this.view.updateAuthButton(false);
        this.view.showSignIn();
      }

    },

    refreshStatus: function () {

      var that = this;
      this.server.status(function (user, task) {

        that.user = user;
        that.task = task;
        that.updateView(user, task);
        that.scheduleRefresh();

      }, function (error) {

        if (error === 'auth') {
          delete that.user;
          delete that.task;
          that.updateView(false);
        } else {
          // TODO
          console.log('Need to handle error: ' + error);
        }

      });

    },

    scheduleRefresh: function () {

      var that = this;
      this.stopRefresh();
      this.refreshTimer = setTimeout(function () {

        that.refreshStatus();

      }, 10000);

    },

    stopRefresh: function () {

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        delete this.refreshTimer;
      }

    },

    home: function () {

      this.updateView(this.user, this.task);
      if (this.user) {
        this.scheduleRefresh();
      }

    },

    about: function () {

      this.stopRefresh();
      this.view.showAbout();

    },

    signOut: function () {

      var that = this;
      this.view.showLoading();
      this.stopRefresh();
      delete this.user;
      delete this.task;
      this.server.authOut(function () {

        that.updateView(false);

      }, function (error) {

        // TODO
        console.log('Need to handle error: ' + error);

      });

    },

    updateTask: function (type) {

      var that = this;
      this.view.showLoading();
      this.stopRefresh();
      this.server.update(type, function (user, task) {

        that.user = user;
        that.task = task;
        that.updateView(user, task);
        that.scheduleRefresh();

      }, function (error) {

        if (error === 'auth') {
          delete that.user;
          delete that.task;
          that.updateView(false);
        } else {
          // TODO
          console.log('Need to handle error: ' + error);
        }

      });

    },

    cancelTask: function () {

      this.updateTask('none');

    }

  };

  $(function () {

    var app = new App();
    app.begin();

  });

})();
