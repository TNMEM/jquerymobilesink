(function() {

  // always try to load freshest map selections from php ...
  // ... if that fails, use LocalStorage from last success.
  $('#home').on('pageshow', function(e, data) {
    // getscript and wait for async callback
    $.getScript("js/api/config.js", function() {

      console.log('window.serv: ' + window.serv);
      //clean up in case this is a "back" button
      $(".geolistAdd").remove();
      //do the AJAX
      $.get(window.serv + '/theData.php?ts=' + new Date().getTime(), function(data) {
        // if error, code in this spotnever fires.
      }).done(function(data) {
        // clean up the standard fall-back items from home.html
        $(".geolistAddSafe").remove();
        console.log('theData.php done:');
        console.log(data);
        if (localStorage) {
          localStorage.setItem('theData', data);
        }
        $("#geolist").append(data);
        $("#geolist").listview('refresh');
      }).fail(function(a, b, error) {
        console.log('theData.php fail:');
        console.log(error);
        if (localStorage && localStorage.getItem('theData')) {
          var theData = localStorage.getItem('theData');
          $("#geolist").append(theData);
          $("#geolist").listview('refresh');
          // clean up the standard fall-back items from home.html
          $(".geolistAddSafe").remove();
        }
      }).always(function() {
        console.log('theData.php always');
      });

    }); // getscript
  }); // pageshow

})(); // function
