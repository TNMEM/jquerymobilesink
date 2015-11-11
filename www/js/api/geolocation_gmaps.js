(function () {

  $('#geolocation_gmaps').on('pageshow', function (e, data) {

    // getscript and wait for async callback
    $.getScript("js/api/config.js", function () {

      // data passed in via config.js:
      console.log('window.dbug: ' + window.dbug);
      console.log('window.serv: ' + window.serv);
      console.log('window.showPanoClose: ' + window.showPanoClose);
      console.log('window.showPegMan: ' + window.showPegMan);

      // data passed in via onclick:
      console.log('window.pcts: ' + window.pcts);
      console.log('window.pty: ' + window.pty);
      console.log('window.geolat: ' + window.geolat);
      console.log('window.geolng: ' + window.geolng);
      console.log('window.presVP: ' + window.presVP);
      console.log('window.blklay: ' + window.blklay);
      console.log('window.pctlay: ' + window.pctlay);
      console.log('window.votlay: ' + window.votlay);

      // data to track the current fusLayerBlk click (uninitialized)
      window.TRACTCE10 = "'%'";
      window.BLOCKCE = "'%'";
      console.log('window.TRACTCE10: ' + window.TRACTCE10);
      console.log('window.BLOCKCE: ' + window.BLOCKCE);

      // set the map_canvas to fullscreen
      sizeCanvas();
      function sizeCanvas() {
        $('#map_canvas').height($(window).height() - $('#geolocation_gmaps div[data-role="header"]').height());
        $('#map_canvas').width($(window).width());
        $('#map_canvas').css({
          height: $('#map_canvas').height() + 'px',
          //width: $('#geolocation_gmaps').width() + 'px'
          width: $('#map_canvas').width() + 'px'
        }); // map_canvas
        //showPop('alert', 'h: ' + $('#map_canvas').height() + 'px' + ' w: ' + $('#map_canvas').width() + 'px')
      }
      
      // geolocate possibly to set the map center IF youHereMark has been created.
      var geocod = "error";
      var youHereMark = "error";
      
      // helper for geocode if we want to "watch" current location
      function geoWatch(aPos) {
        window.geoLat = aPos.coords.latitude;
        window.geolng = aPos.coords.longitude;
        map.setCenter(window.geolat, window.geolng);
        console.log('geoWatch');
      }

      GMaps.geolocate({
        error: function (error) {
          console.log('Geolocation failed: ' + error.message);
          geocod = false;
        },
        not_supported: function () {
          console.log("Geolocation failed: No browser support.");
          geocod = false;
        },
        success: function (position) {
          console.log("Geolocation success!");
          geocod = true;
          // You are here ...
          window.geolat = position.coords.latitude;
          window.geolng = position.coords.longitude;
          map.setCenter(window.geolat, window.geolng);
          // don't move the pin if it hasn't been created!
          if (youHereMark != "error") {
            doMovePIN(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
          }
          //var watchId = navigator.geolocation.watchPosition(geoWatch);
        },
        always: function () {}
      });
 
      // helper to manage jQuery popup code (no need to change the html file)
      function showPop(popupType, arg1, arg2, arg3, arg4) {
        // check if popup element already exists
        if ($("#PopUp").length > 0) {
          $("#PopUp").remove();
        }
        // get active (current) page ID
        var id = $.mobile.activePage.attr("id");
        // add input popup 'block' ... arg2 and arg4 are 'window' variables to change
        if (popupType == 'censusBlock') {
          if (arg2.trim() == '%') {
            arg2 = '';
          }
          if (arg4.trim() == '%') {
            arg4 = '';
          }
          $("#" + id).append(
            "<div data-role='popup' id='PopUp' class='ui-content' data-position-to='window' data-dismissible='false'>" + 
              "<form id='cb'>" + 
                "<h4>Census Block ...</h4>" + 
                "<label for='cba2'>" + arg1 + "</label>" + 
                "<input type='text' name='cba2name' id='cba2' value='" + arg2.trim() + "' />" + 
                "<label for='cba4'>" + arg3 + "</label>" + 
                "<input type='text' name='cba4name' id='cba4' value='" + arg4.trim() + "' />" + 
                "<input type='button' data-mini='true' data-inline='true' id='cbClear' value='All Blocks' />" + 
                "<input type='button' data-mini='true' data-inline='true' id='cbGo' value='Selected' />" + 
              "</form>" + 
            "</div>"
          );
        }
        // add alert popup 'alert' ... also a catch-all with arg1
        else if ((popupType == 'alert') || (typeof popupType !== 'undefined')) {
          $("#" + id).append(
            "<div data-role='popup' id='PopUp' class='ui-content' data-position-to='window'>" + 
              "<a href='#' data-rel='back' data-role='button' data-icon='delete' data-iconpos='notext' class='ui-btn-right'>Close</a>" + 
              arg1 + 
            "</div>"
          );
          // ... or, could add your text to the popup
          //$("#PopUp").append(arg1);
        }
        // "refresh" the page with new popup elements
        $("#" + id).trigger('create');
        // bind to what is required and do some work
        if (popupType == 'censusBlock') {
          $("#cbGo, #cbClear").bind("click", function (event, ui) {
            console.log('cbGo = event, ui:');
            console.log(event);
            console.log(ui);
            //if ($(this).attr('id') == 'cbClear') {
            if (this.id == 'cbClear') {
              // these are within html above ... not undeclared
              $("#cba2").val('');
              $("#cba4").val('');
            }
            window.TRACTCE10 = $("#cba2").val().trim();
            if (window.TRACTCE10 === '') {
              window.TRACTCE10 = '%';
            }
            window.BLOCKCE = $("#cba4").val().trim();
            if (window.BLOCKCE === '') {
              window.BLOCKCE = '%';
            }
            doFusLayerBlk();
            $("#PopUp").popup("close");
          });
        }
        // open the popup
        $("#PopUp").popup("open");
      } // showPop

      // zNum is initially zoomed out, but zoom in if not window.pres(erve)V(iew)P(ort).
      var zNum = 4;
      if (!window.presVP) {
        zNum = 16;
      }
      
      //google.maps.visualRefresh = true; // instead use enableNewStyle below
      var map = new GMaps({
        div: '#map_canvas',
        lat: window.geolat,
        lng: window.geolng,
        zoom: zNum,
        enableNewStyle: true,

        panControl: true,
        panControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.small,
          position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: window.showPegMan,
        overviewMapControl: false
      });

      // helper to set "approx" address in youHereWind
      function setYouHereWindContent(aLat, aLng) {
        GMaps.geocode({
          lat: aLat,
          lng: aLng,
          callback: function (results, status) {
            if (status == 'OK') {
              console.log('geocode results:');
              console.log(results);
              console.log('formatted address; ' + results[0].formatted_address);
              // results[0].formatted_address; // "1646 Linden Avenue ...
              youHereWind.setContent('<div class="s-info-window" style="font-family: Helvetica, Arial, sans-serif; font-size: 11px"><a href="#votPanel"><img src="images/notepad.png" width="30px"></a><b>Here...</b><br><b>Approx:</b> ' + (results[0].formatted_address).replace(', USA', '') + '<br><b>Latitude:</b> ' + aLat.toFixed(6) + ' <b>Longitude:</b> ' + aLng.toFixed(6) + '</div>');
              setVotPanelContent('Name Here', 'Put Address in Comment.');
            } else {
              youHereWind.setContent('<div class="googft-info-window" style="font-family: Helvetica, Arial, sans-serif; font-size: 11px"><b>Here...</b><br><b>Approx:</b> ' + "Unavailable" + '<br><b>Latitude:</b> ' + aLat.toFixed(6) + ' <b>Longitude:</b> ' + aLng.toFixed(6) + '</div>');
              setVotPanelContent('Name Here', 'Put Address in Comment.');
            }
          }
        });
      }

      // center and mark current position
      map.setCenter(window.geolat, window.geolng);
      // infowindow for youHereMark
      var youHereWind = new google.maps.InfoWindow({disableAutoPan: false, maxWidth: 300});
      setYouHereWindContent(window.geolat, window.geolng);

      // could create custom panorama, but it doesn't share map overlays
      /*
      var aLoc = new google.maps.LatLng(window.geolat, window.geolng);
      var panoOptions = {
        position: aLoc,
        addressControlOptions: {
          position: google.maps.ControlPosition.BOTTOM_CENTER
        },
        linksControl: true,
        panControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        enableCloseButton: window.showPanoClose
      };

      var pano = new google.maps.StreetViewPanorama(document.getElementById('map_canvas'), panoOptions);
      map.setStreetView(pano);
      */

      //map's default panorama.
      var pano = map.getStreetView();

      // can set options slightly different ways ... any way to set is good ...
      pano.set('disableDefaultUI', true);
      pano.setOptions({
        panControl: true,
        panControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.small,
          position: google.maps.ControlPosition.LEFT_BOTTOM
        }
      });
      pano.set('linksControl', true);
      pano.set('enableCloseButton', window.showPanoClose);
      pano.set('addressControl', false);
      pano.set('clickToGo', true);
      pano.setVisible(false);

      // screen orientation change ... kusing resize from window
      $.mobile.orientationChangeEnabled = false;
      $( window ).on( "resize", function( event ) {
        //showPop("alert", event.orientation + " mode!");
        sizeCanvas();
        if (pano.getVisible() === false) {
          google.maps.event.trigger(pano,'resize');
        }
        else {
          google.maps.event.trigger(map,'resize');
        }
      });
      
      // pinch zoom
      var hammertime = $(window).hammer();
      hammertime.on('pinchin pinchout', function(event) {
        if (pano.getVisible() === false) {
          map.setZoom = event.scale * map.getZoom();
        }
        else {
          pano.setZoom = event.scale * pano.getZoom();
        }
      });

      // add a listener for pano position_changed.
      // watch for changes that really are the same location.
      var panoPos = 0;
      google.maps.event.addListener(pano, 'position_changed', function () {
        if (panoPos != (' ' + pano.getPosition().lat() + ',' + pano.getPosition().lng())) {
          panoPos = ' ' + pano.getPosition().lat() + ',' + pano.getPosition().lng();
          console.log('pano position_changed: ' + pano.getPosition());
          GMaps.geocode({
            lat: pano.getPosition().lat(),
            lng: pano.getPosition().lng(),
            callback: function (results, status) {
              if (status == 'OK') {
                console.log('geocode results:');
                console.log(results);
                // want "Linden" or "Parkway"
                // example: aLocation.split(' ')[0]; // first word: "Linden" ... "South"
                var aLocation = results[0].address_components[1].long_name;
                aLocation = aLocation.toLowerCase();
                console.log('long street name; ' + aLocation); // "linden avenue" or "south parkway east" or "north parkway"
                var aStreet = aLocation.split(" ");
                var aDir = ['north', 'south', 'east', 'west'];
                if (((aStreet.length) == 2) && (aDir.indexOf(aStreet[0]) == -1)) { // two words and first word NOT north/south/east/west
                  aStreet = aStreet[0];
                } else {
                  aStreet = aStreet[1];
                }
                nearLatLng(pano.getPosition().lat(), pano.getPosition().lng(), aStreet);
              } // status OK
              else {
                nearLatLng(pano.getPosition().lat(), pano.getPosition().lng(), '%');
              }
            } // callback
          }); // geocode
        } // if
      }); // position_changed
                  
      // stuff for the click detect in youHereMark.
      var aDate;
      var aLatLng;
      youHereMark = map.addMarker({
        lat: window.geolat,
        lng: window.geolng,
        suppressInfoWindows: true,
        clickable: true,
        draggable: true,
        // mousedown starts timer
        mousedown: function (e) {
          aDate = new Date();
          aLatLng = e.latLng;
        },
        // mouseup ends timer
        mouseup: function (e) {
          var aDate2 = new Date();
          // lo-o-ong click ... unless marker moves
          if ((aDate2 - aDate) > 800 && aLatLng.equals(e.latLng)) {
            console.log('lClick');
            if (pano.getVisible() === false) {
              // find center point of nearest panorama to youHereMark and set street view position.
              var service = new google.maps.StreetViewService();
              service.getPanoramaByLocation(youHereMark.getPosition(), 50, function (panoData, dataStatus) {
                if (panoData !== null) {
                  pano.setPosition(panoData.location.latLng);
                  var heading = google.maps.geometry.spherical.computeHeading(pano.getPosition(), youHereMark.getPosition());
                  heading = (heading + 360) % 360;
                  var pov = pano.getPov();
                  pov.heading = heading;
                  pano.setPov(pov);
                  panoPos = 0;
                  pano.setVisible(true);
                }
                else {
                  showPop('alert', 'No <b>Street View</b> available');
                }
              });
            }
            else {
              clearNearMarks();
              pano.setVisible(false);
              map.setCenter(youHereMark.getPosition().lat(), youHereMark.getPosition().lng());
              youHereWind.close();
            }
          }
          // short click ... unless marker moves
          else if (aLatLng.equals(e.latLng)) {
            console.log('sClick');
            if (pano.getVisible() === true) {
              youHereWind.open(pano, youHereMark);
            }
            else {
              youHereWind.open(map.map, youHereMark);
            }
          }
        },
        dragend: function (e) {
          console.log('dragend');
          doMovePIN(e.latLng);
        }
      });
      // standard icons: http://stackoverflow.com/questions/8248077/google-maps-v3-standard-icon-shadow-names-equiv-of-g-default-icon-in-v2
      // there are also a few in www/images
      // (scaling worked until made draggable.)
      youHereMark.setIcon({
        //url: 'https://maps.gstatic.com/mapfiles/ms2/micons/grn-pushpin.png',
        url: 'images/you-are-here.png'
        //scaledSize: {height: 20, width: 20}
      });

      // add a custom control button PINS
      map.addControl({
        position: 'right_center',
        content: 'PINS',
        style: {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#fff'
        },
        events: {
          click: function () {
            fusLayerVot.setMap(null);
            if (pinSize == 'small') {
              pinSize = 'large';
            }
            else if (pinSize == 'large') {
              pinSize = 'small';
            }
            doFusLayerVot();
          }
        }
      });

      // add a custom control button GOP
      map.addControl({
        position: 'right_center',
        content: 'GOP',
        style: {
          color: 'white',
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#f00'
        },
        events: {
          click: function () {
            fusLayerVot.setMap(null);
            window.pty = "GOP";
            doFusLayerVot();
          }
        }
      });

      // add a custom control button DEM
      map.addControl({
        position: 'right_center',
        content: 'DEM',
        style: {
          color: "white",
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#00f'
        },
        events: {
          click: function () {
            fusLayerVot.setMap(null);
            window.pty = "DEM";
            doFusLayerVot();
          }
        }
      });

      // add a custom control button ALL
      map.addControl({
        position: 'right_center',
        content: 'ALL',
        style: {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#fff'
        },
        events: {
          click: function () {
            fusLayerVot.setMap(null);
            window.pty = "%";
            doFusLayerVot();
          }
        }
      });

      // add a custom control button PCTS
      map.addControl({
        position: 'right_center',
        content: 'PCTS',
        style: {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#ff0'
        },
        events: {
          click: function () {
            // if not present, draw block layer.
            if (fusLayerPct == "error") {
              fusLayerPct = map.loadFromFusionTables({
                suppressInfoWindows: true,
                clickable: true,
                events: {
                  click: function (point) {
                    // if an object, then don't label inline.
                    console.log('fusLayerPct point:');
                    console.log(point);
                    pctWind.setContent('<div class="googft-info-window" style="font-family: Helvetica, Arial, sans-serif; font-size: 11px"> ' + '<b>Description:</b> ' + point.row.Description.value + '</div>');
                    pctWind.setPosition(point.latLng);
                    pctWind.open(map.map);
                  }
                },
                query: {
                  select: 'geometry',
                  from: window.pctlay, // Precincts
                  where: 'Name like "%"'
                },
                preserveViewport: false,
                // styleId from fusion table since cannot dynamically style more than one layer.
                // guess or try https://developers.google.com/fusiontables/docs/v1/reference/style/list
                styleId: 2
              });
              if (fusLayerBlk !== "error") {
                fusLayerBlk.setMap(null);
              }
              blkWind.close();
              fusLayerBlk = "error";
              fusLayerVot.setMap(null);
              doFusLayerVot();
            }
            else {
              pctWind.close();
              fusLayerPct.setMap(null);
              fusLayerPct = "error";
            }
          }
        }
      });

      // helper for the custom control BLKS to actually load the layer
      function doFusLayerBlk() {
        fusLayerBlk = map.loadFromFusionTables({
          suppressInfoWindows: true,
          clickable: true,
          events: {
            click: function (point) {
              // if an object, then don't label inline.
              console.log('fusLayerBlk point:');
              console.log(point);
              window.TRACTCE10 = point.row.TRACTCE10.value;
              window.BLOCKCE = point.row.BLOCKCE.value;
              blkWind.setContent('<div class="googft-info-window" style="font-family: Helvetica, Arial, sans-serif; font-size: 11px"> ' + '<b>TRACTCE10:</b> ' + point.row.TRACTCE10.value + '<br> ' + '<b>BLOCKCE:</b> ' + point.row.BLOCKCE.value + '<br> ' + '<b>HOUSING10:</b> ' + point.row.HOUSING10.value + '<br> ' + '<b>POP10:</b> ' + point.row.POP10.value + '</div>');
              blkWind.setPosition(point.latLng);
              blkWind.open(map.map);
            }
          },
          query: {
            select: 'geometry',
            from: window.blklay, // Blocks
            where: "TRACTCE10 like " + window.TRACTCE10 + " and BLOCKCE like " + window.BLOCKCE
          },

          preserveViewport: false,
          // styleId from fusion table since cannot dynamically style more than one layer.
          // guess or try https://developers.google.com/fusiontables/docs/v1/reference/style/list
          styleId: 2
        });
        fusLayerVot.setMap(null);
        doFusLayerVot();
      } // doFusLayerBlk

      // add a custom control button BLKS
      map.addControl({
        position: 'right_center',
        content: 'BLKS',
        style: {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#0ff'
        },
        events: {
          click: function () {
            // if not present, draw block layer.
            if (fusLayerBlk == "error") {
              // 'window' variables will be changed by dialog!
              // fusLayerBlk then fusLayerVot will be drawn after popup is dismissed
              showPop('censusBlock', 'Tract number:', window.TRACTCE10, 'Block number:', window.BLOCKCE);
              if (fusLayerPct !== "error") {
                fusLayerPct.setMap(null);
              }
              pctWind.close();
              fusLayerPct = "error";
            }
            else {
              blkWind.close();
              fusLayerBlk.setMap(null);
              fusLayerBlk = "error";
            }
          }
        }
      });

      // almost the same as dragend of youHereMark
      function doMovePIN(aLatLng) {
        console.log('doMovePIN');
        youHereMark.setPosition(aLatLng);
        window.geolat = aLatLng.lat();
        window.geolng = aLatLng.lng();
        setYouHereWindContent(window.geolat, window.geolng);
        // fix up
        youHereWind.close();
      }

      /*
      // helper to return next panorama along current heading
      function moveForward(aPano) {
        var curr = aPano.links[0];
        var i;
        for (i = 0; i < aPano.links.length; i++) {
          if (difference(curr.heading, aPano.pov.heading) > difference(aPano.links[i].heading, aPano.pov.heading)) {
            curr = aPano.links[i];
          }
        }
        // curr is whole link structure heading, description, pano (string), roadColor, roadOpacity.
        return (curr.pano);
      }
      */
      
      // generalized helper for difference in two headings (moveForward, others)
      function difference(head1, head2) {
        var diff = Math.abs(head2 % 360 - head1);
        if (diff > 180) {
          diff = Math.abs(360 - diff);
        }
        return diff;
      }

      // add a custom control button PIN-1 (2nd arg. "pano" = street view)
      map.addControl({
        position: 'right_center',
        content: 'HERE',
        style: {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#0f0'
        },
        events: {
          click: function () {
            if (pano.getVisible() === true) {
              aLatLng = google.maps.geometry.spherical.computeOffset(
                pano.getPosition(),
                20, // meters
                pano.getPov().heading,
                6378137 // earth radius meters
              );

              // find closest panorama's center point along heading ... async and uses Internet!
              /*
              var service = new google.maps.StreetViewService();
              service.getPanoramaById(moveForward(pano), function(panoData, dataStatus) {
                if (panoData !== null) {
                  aLatLng = panoData.location.latLng;
                }
                else {
                  showPop('alert', 'No <b>Street View</b> available');
                }
              });
              */
              
              /*
              // local way ... find new lat/lng at specific distance along heading to stick a pin in it.
              var aPos = new google.maps.LatLng();
              aPos = pano.getPosition();
              var latA = aPos.lat();
              var lngA = aPos.lng();
              var dist = 20; //Meters
              var head = pano.getPov().heading;
              var dx = dist * Math.sin(head * 0.0175); // degrees from North * 0.0175 = radians
              var dy = dist * Math.cos(head * 0.0175);
              var dLatA = dy / 110540;
              var dLngA = dx / (111320 * Math.cos(latA * 0.0175));
              aLatLng = new google.maps.LatLng(latA + dLatA, lngA + dLngA);
              doMovePIN(aPos);
              */
              
              // don't label objects inline.
              doMovePIN(aLatLng);
              console.log("youHere: " + youHereMark.getPosition());
              console.log("pano: " + pano.getPosition());
            }
          }
        }
      }, pano);

      // add a custom control button PIN-2 (no 2nd arg. = map view)
      map.addControl({
        position: 'right_center',
        content: 'HERE',
        style: {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#0f0'
        },
        events: {
          click: function () {
            if (pano.getVisible() === false) {
              aLatLng = map.getCenter();
              doMovePIN(aLatLng);
            }
          }
        }
      });

      //--------------------------------------
      // in-pano markers
      //
      // ... later we will show them going into street view.
      // ... then remove them going out of street view.

      // called: nearLatLng(35.1343075098425, - 90.0067435061961, "Linden");

      // infowindow for nearMark
      var nearWind = new google.maps.InfoWindow({disableAutoPan: false, maxWidth: 300});
      var nearMarkList = [];

      function nearLatLng(aLat, aLng, aStreet) {
        // start with AJAX to php ... async and uses Internet!
        $.getJSON(window.serv + '/nearLatLng.php?ts=' + new Date().getTime() + '&aLat=' + aLat + '&aLng=' + aLng + '&aDist=' + '0.0005' + '&aStreet=' + aStreet + '&aVotLay=' + window.votlay + '&aParty=' + window.pty, function (data) {
          // if error, code in this spot never fires.
        }).done(function (data) {
          // don't label objects inline.
          console.log("nearLatLng Done data:");
          console.log(data);
          // on success, clear any existing nearMark ...
          clearNearMarks();
          // add a "wiggle" to lat/lng to split icons with same lat/lng
          // ... about -0.00002 to +0.00002 (meters) east/west and/or north/south
          // ... (+row.Latitude) is an effort to cast as number
          //var aWig = Math.random() * ((+0.00002) - (-0.00002)) + (-0.00002);
          var aWig = 0;
          var aGrp = 0;
          $.each(data.rows, function (index, row) {
            // wiggle "group"
            if ((row.Latitude + ',' + row.Longitude) != aGrp) {
              // new group
              aGrp = row.Latitude + ',' + row.Longitude;
              aWig = 0;
            } else {
              // existing group
              aWig = aWig + 0.00001;
            }
            wigNearMark(aWig, row);
          });
        }).fail(function () {
          console.log("nearLatLng Fail");
        }).always(function () {
          console.log("nearLatLng Always");
        });
      } // nearLatLng
      
      // handle the wiggle of nearMark 
      function wigNearMark(aWig, row) {
        //aTmpLL is where the house is located and panoData is location of photo car
        var aTmpLL = new google.maps.LatLng((+row.Latitude), (+row.Longitude));
        var service = new google.maps.StreetViewService();
        service.getPanoramaByLocation(aTmpLL, 50, function (panoData, dataStatus) {
          if (panoData !== null) {
            console.log('panoData for wiggle: ');
            console.log(panoData);
            // pHeading is pano car heading + 90 degrees for 1st perpendicular
            var pHeading = (panoData.links[0].heading + 360 + 90) % 360;
            // pHeading2 is the reversed 2nd perpendicular
            var pHeading2 = (pHeading + 180) % 360;
            // heading is from house address to pano car
            var heading = google.maps.geometry.spherical.computeHeading(aTmpLL, panoData.location.latLng);
            var headingDist = google.maps.geometry.spherical.computeDistanceBetween(
              aTmpLL,
              panoData.location.latLng,
              6378137 // earth radius meters
            );
            heading = (heading + 360) % 360;
            // pHeading or pHeading2 closer to original heading?
            if ( difference(pHeading, heading) < difference(pHeading2, heading) ) {
              heading2 = pHeading;
              //aWig *= 1;
            }
            else {
              heading2 = pHeading2;
              aWig *= -1;
            }
            //headingDist is from house to pano car, but is very close to 90-degree distance
            var nearMarkLoc = google.maps.geometry.spherical.computeOffset(
              aTmpLL,
              headingDist - 15, // meters from street more or less
              heading2,
              6378137 // earth radius meters
            );
            console.log('wig, street, mark, house: ' + aWig + ', ' + panoData.location.latLng + ', ' + nearMarkLoc + ', ' + aTmpLL);
            console.log('pHeading, pHeading2, heading, heading2, headingDist: ' + pHeading + ', ' + pHeading2 + ', ' + heading + ', ' + heading2 + ', ' + headingDist);
            doNearMark(nearMarkLoc, aWig, row);
          } else {
            //showPop('alert', 'No <b>Street View</b> available');
            doNearMark(aTmpLL, aWig, row);
          }
        });
      }
      
      // helpers for note-taking panel
      // info-taker's identity
      var votPanelID = "";
      
      // helper for note-taking panel ... nearWind and votWind
      function setVotPanelContent(aName, aPlace) {
        $('#votPanelForm').trigger('reset');
        $('#votPanelName').val(aName);
        $('#votPanelPlace').replaceWith('<p id="votPanelPlace">' + aPlace + '</p>');
        $('#votPanelID').val(votPanelID);
        $( "#votPanel" ).trigger( "updatelayout" );
      } // setVotPanelContent
      
      // helper for note-taking panel on 'Cancel"
      $('#votPanelCancel').on('click', function(e, data){
        console.log('votPanelCancel');
        $('#votPanelForm').trigger('reset');
        nearWind.close();
        votWind.close();
        youHereWind.close();
      }); // Cancel
      
      // helper for note-taking panel on 'Save"
      $('#votPanelSave').on('click', function(e, data){
        console.log('votPanelSave');
        var votPanelItem = {
          Table: window.votlay + '_pan',
          Name: $('#votPanelName').val(),
          Place: $('#votPanelPlace').text(),
          Call: $('#votPanelCall').prop('checked'),
          Text: $('#votPanelText').prop('checked'),
          Sign: $('#votPanelSign').prop('checked'),
          Tel: $('#votPanelTel').val(),
          Comm: $('#votPanelComm').val(),
          Ident: $('#votPanelID').val()
        };
        // extra for local tracking in dialog
        votPanelID = $('#votPanelID').val();
        $('#votPanelForm').trigger('reset');
        nearWind.close();
        votWind.close();
        youHereWind.close();
        // store in SQL table via PHP
        $.post(window.serv + '/votPanel.php', {item:votPanelItem}, function(data) {
          //showPop('alert', data);
        }).done(function(data) {
          showPop('alert', data);
        }).fail(function() {
          showPop('alert', data);
        }).always(function() {
          //nothing
        });
      }); // Save
      
      // actually make the nearMark markers
      function doNearMark(nearMarkLoc, aWig, row) {
        var nearMark;
        nearMark = map.addMarker({
          lat: nearMarkLoc.lat() + aWig,
          lng: nearMarkLoc.lng() + aWig,
          suppressInfoWindows: true,
          clickable: true,
          click: function (e) {
            var aParty = row.Party || 'NONE';
            nearWind.setContent('<div class="googft-info-window" style="font-family: Helvetica, Arial, sans-serif; font-size: 11px"><a href="#votPanel"><img src="images/notepad.png" width="30px"></a> ' + '<b>Party:</b> ' + aParty + ' ' + '<b>PCT:</b> ' + row.PCT + '<br> ' + '<b>Name:</b> ' + row.Name + '<br> ' + '<b>Place:</b> ' + row.Place + '<br> ' + '<b>Race:</b> ' + row.Race + ' ' + '<b>Sex:</b> ' + row.Sex + '<br> ' + '<b>Birth:</b> ' + (row.Birth).replace(' 00:00:00', '') + ' ' + '<b>FirstReg:</b> ' + (row.FirstReg).replace(' 00:00:00', '') + '<br> ' + '<b>Latitude:</b> ' + parseFloat(row.Latitude).toFixed(6) + ' ' + '<b>Longitude:</b> ' + parseFloat(row.Longitude).toFixed(6) + '</div>');
            setVotPanelContent(row.Name, row.Place);
            nearWind.setPosition(e.latLng);
            // show in pano
            if (pano.getVisible() === true) {
              nearWind.open(pano, nearMark);
            }
            // shouldn't happen, but show in map
            else {
              nearWind.open(map.map, nearMark);
            }
          } // click
        });
        // track the new marker array.
        nearMarkList.push(nearMark);
        // color that marker.
        if (row.Party == 'DEM') {
          nearMark.setIcon({
            url: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png'
            //scaledSize: {height: 20, width: 20}
          });
        }
        else if (row.Party == 'GOP') {
          nearMark.setIcon({
            url: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png'
            //scaledSize: {height: 20, width: 20}
          });
        }
        else {
          nearMark.setIcon({
            url: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png'
            //scaledSize: {height: 20, width: 20}
          });
        }
      }

      // helper for nearLatLng to clear the markers created earlier
      function clearNearMarks() {
        console.log('clearNearMarks');
        for (var i = 0; i < nearMarkList.length; i++) {
          nearMarkList[i].setMap(null);
        }
        // double-hepto-clean
        nearMarkList.length = 0;
        nearMarkList = [];
      }
      //--------------------------------------

      // load the fusion table layer(s) from google docs
      // TOP Midtown geocoded by Texas A&M (very good) from April 2012 data.
      var fusLayerPct = "error";
      var fusLayerBlk = "error";
      var fusLayerVot = "error";
      var pinSize = "small";
      // infowindows for voter fusion layers.
      var pctWind = new google.maps.InfoWindow({disableAutoPan: false, maxWidth: 300});
      var blkWind = new google.maps.InfoWindow({disableAutoPan: false, maxWidth: 300});
      var votWind = new google.maps.InfoWindow({disableAutoPan: false, maxWidth: 300});

      // first time
      doFusLayerVot();

      // helper to actually draw the fusion layer
      function doFusLayerVot() {
        // load Voter layer
        fusLayerVot = map.loadFromFusionTables({
          clickable: true,
          suppressInfoWindows: true,
          query: {
            // Latitude connected to Longitude column at fusion docs
            select: 'Latitude',
            from: window.votlay,
            where: ' Party like ' + '\'%' + window.pty + '%\'' + ' AND ' + window.pcts + ' ORDER by Party desc'
          },
          preserveViewport: window.presVP,
          events: {
            click: function (point) {
              // don't label objects inline.
              console.log('fusLayerVot point:');
              console.log(point);
              console.log(window.geolat);
              console.log(window.geolng);
              // could use a haversine locally or via php (ajax) "composer" library.
              // local way ... pythagoras' get distance between lat/lng points.
              // explainer: http://www.movable-type.co.uk/scripts/latlong.html AND latlon.js Github
              // degrees from North * 0.0175 = radians
              /*
              var x = (window.geolng * 0.0175 - point.latLng.lng() * 0.0175) * Math.cos((point.latLng.lat() * 0.0175 + window.geolat * 0.0175) / 2);
              var y = (window.geolat * 0.0175 - point.latLng.lat() * 0.0175);
              var d = (Math.sqrt(x * x + y * y) * 6378137) / 1609.34; // radius of earth in meters then meters per mile
              */

              var d = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(window.geolat, window.geolng),
                point.latLng,
                6378137 // earth radius meters
              );
              d = d / 1609.34; // meters to miles

              //votWind.setContent(point.infoWindowHtml + '<b>Distance:</b> ' + d.toFixed(2) + ' miles');
              var aParty = point.row.Party.value || 'NONE';
              votWind.setContent('<div class="googft-info-window" style="font-family: Helvetica, Arial, sans-serif; font-size: 11px"><a href="#votPanel"><img src="images/notepad.png" width="30px"></a> ' + '<b>Party:</b> ' + aParty + ' ' + '<b>PCT:</b> ' + point.row.PCT.value + '<br> ' + '<b>Name:</b> ' + point.row.Name.value + '<br> ' + '<b>Place:</b> ' + point.row.Place.value + '<br> ' + '<b>Race:</b> ' + point.row.Race.value + ' ' + '<b>Sex:</b> ' + point.row.Sex.value + '<br> ' + '<b>Birth:</b> ' + (point.row.Birth.value).replace(' 00:00:00', '') + ' ' + '<b>FirstReg:</b> ' + (point.row.FirstReg.value).replace(' 00:00:00', '') + '<br> ' + '<b>Latitude:</b> ' + parseFloat(point.row.Latitude.value).toFixed(6) + ' ' + '<b>Longitude:</b> ' + parseFloat(point.row.Longitude.value).toFixed(6) + '<br> ' + '<b>Distance:</b> ' + d.toFixed(2) + ' miles' + '</div>');
              setVotPanelContent(point.row.Name.value, point.row.Place.value);
              // this is the infowindow when click on markers in fusion layer.
              votWind.setPosition(point.latLng);
              if (pano.getVisible() === true) {
                votWind.open(pano);
              }
              else {
                votWind.open(map.map);
              }
            } //end click
          }, //end events
          // only one fusion layer can be dynamically styled
          // ... can have 5 data-selected versions.
          // static "styleId" can be used on all layers, however.
          styles: [{
            markerOptions: {
              iconName:  pinSize + '_yellow'
            }
          }, {
            where: "Party like '%DEM%'",
            markerOptions: {
              iconName: pinSize + '_blue'
            }
          }, {
            where: "Party like '%GOP%'",
            markerOptions: {
              iconName: pinSize + '_red'
            }
          }]
        }); //loadFromFusionTables
      }

    }); // getscript

  }); // on pageshow

})(); // function
