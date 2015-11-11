(function() {

  $('#geolocation_orig').on('pageshow', function(e, data) {
    // getscript and wait for async callback ... ajax, but right here.
    $.getScript("js/api/config.js", function() {

      //console.log(window.serv);
      // fullscreen map
      $('#map_canvas').height($(window).height() - $('#geolocation_orig div[data-role="header"]').height());
      //console.log($(window).height());
      //console.log($('#geolocation_orig div[data-role="header"]').height());
      $('#map_canvas').css({
        height: $('#map_canvas').height() + 'px',
        width: $('#geolocation_orig').width() + 'px'
      });

      var onSuccess = function(position) {
        //console.log(position);
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);


        var map = new google.maps.Map(document.getElementById("map_canvas"), {
          zoom: 4,
          /* 4 is really zoomed out, 12 is about right for "real" map. */
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var marker = new google.maps.Marker({
          icon: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
          position: latlng,
          map: map,
          title: "You Are Here"
        });

        var kmlUrl = "error";
        var kmlUrl2 = "error";
        if (window.indInd === 0) {
          kmlUrl = window.serv + '/randpoint.php?v=' + (Math.floor((Math.random() * 10000) + 1));
        }
        if (window.indInd == 1) {
          // both encoded by Texas A&M (very good) from April 2012 data.
          kmlUrl = window.serv + '/16-1_DEM.kml?v=' + (Math.floor((Math.random() * 10000) + 1));
          kmlUrl2 = window.serv + '/16-1_GOP.kml?v=' + (Math.floor((Math.random() * 10000) + 1));
        }
        if (window.indInd == 2) {
          kmlUrl = window.serv + '/16-1_DEM.kml?v=' + (Math.floor((Math.random() * 10000) + 1));
        }
        if (window.indInd == 3) {
          kmlUrl = window.serv + '/16-1_GOP.kml?v=' + (Math.floor((Math.random() * 10000) + 1));
        }
        //alert(kmlUrl + '<br>\n' + kmlUrl2);
        var kmlOptions = {
          suppressInfoWindows: false,
          preserveViewport: window.presVP,
          /* false with real multi-marker kml for auto-zoom-in. */
          map: map
        };
        var kmlLayer = new google.maps.KmlLayer(kmlUrl, kmlOptions);
        kmlLayer.setMap(map);
        if (kmlUrl2 != "") {
          kmlLayer = new google.maps.KmlLayer(kmlUrl2, kmlOptions);
          kmlLayer.setMap(map);
        }
        // END OF LOU KING ADD
      };

      var onFail = function() {
        //console.log('Failed to get geolocation_orig');
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onFail);

    });
  });

})();
