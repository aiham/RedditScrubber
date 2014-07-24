$(function () {

  var $container = $('#container');
  var auth = false, username = 'Guest';

  // Status
  var $status = $('<h1>').text('Loading...');
  $container.append($status);

  // Link
  var $ul = $('<ul>');
  var $li = $('<li>');
  var $a = $('<a href="#">');
  $li.append($a);
  $ul.append($li);

  var updateLink = function () {

    if (auth) {
      $a.text('Sign Out').attr('href', '/auth/out');
    } else {
      $a.text('Sign In').attr('href', '/auth');;
    }
    $status.text('Welcome ' + username);
    $container.append($a);

  };

  $a.click(function (e) {
    e.preventDefault();

    if (!auth) {
      window.location.href = '/auth';
      return;
    }

    $status.text('Loading...');
    $(this).detach();

    $.post('/api/auth/out', function (data) {

      console.log('/api/auth/out response:');
      console.log(data);

      auth = !!data.user;
      username = 'Guest';
      updateLink();

    });
  });

  // Get auth info
  $.get('/api/status', function (data) {

    console.log('/api/status response:');
    console.log(data);

    auth = !!data.user;
    username = auth ? data.user.username : 'Guest';
    updateLink();

  });

});
