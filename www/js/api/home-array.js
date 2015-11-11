(function() {
// NOT USED, but keep as example.

  // always try to load freshest map selections from php ...
  // ... if that fails, should have LocalStorage from last success.
  $('#index').on('pageshow', function(e, data) {
    //alert('start');
    if (localStorage && localStorage.getItem('theData')) {
      var theData = JSON.parse(localStorage.getItem('theData'));
      //console.log('had it');
      //console.log(JSON.parse(theData));
    }
    else {
      $.get('http://jquerymobilesink.louisking.c9.io/theData.php', function(data) {
        if (localStorage) {
          localStorage.setItem('theData', JSON.stringify(data));
        }
        //console.log('got it');
        //console.log(JSON.parse(data));
      });
    }
  });

})();
