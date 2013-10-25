// callback function
function stations_output(stations) {
  // removes loading screen after we get results
  $('#stations').html("");

  // set up icons
  var towerIcon = L.icon({
    className: 'tower-marker',
    iconUrl: 'img/marker-tower-2x.png',
    iconSize: [25, 25]
  });
  var notifyIcon = L.icon({
    iconUrl: 'img/marker-notify-2x.png',
    iconSize: [25, 25]
  });
  var dontNotifyIcon = L.icon({
    iconUrl: 'img/marker-ok-2x.png',
    iconSize: [25, 25]
  });

  var curStationIcon;  // to switch the station icon
  
  if (stations.stations[0].ant_mode === undefined) {  // no results
    $.get('templates/stations.html', function(templates) {
      var template = $(templates).filter('#stations-none').html();
      var html = Mustache.to_html(template);
      $(html).hide().appendTo("#stations");
    });
  } else {  // yes results
    // loop through api results
    $.each(stations.stations, function(key, curStation) {
      var modStation = new station(curStation, $("#height").val());
      curStation.isCritical = modStation.notify();

      /*
      // APpend modified result
      $.get('templates/stations.html', function(templates) {
        var template = $(templates).filter('#station-detail').html();
        var html = Mustache.to_html(template, curStation);
        $(html).appendTo("#station-" + modStation.notify());
      });
      
      // add the map
      // interval required to make sure the map container exists
      var checkExist = setInterval(function() {
         if ($('#st'+curStation.facid+'-'+curStation.hours_operation+'-map').length) {
            // set up map for a station
            var stationMap = L.mapbox.map('st'+curStation.facid+'-'+curStation.hours_operation+'-map', 'fcc.map-fd8wksyc', {zoomControl: false}).setView([curStation.decimal_lat_nad83, curStation.decimal_lon_nad83], 12);
            // no need for zoom, etc
            stationMap.dragging.disable();
            stationMap.touchZoom.disable();
            stationMap.doubleClickZoom.disable();
            stationMap.scrollWheelZoom.disable();

            // add proposed tower marker
            L.marker([$("#lat").val(), $("#long").val()], {
              icon: towerIcon
            }).bindPopup("<strong>YOUR TOWER.<strong>").addTo(stationMap);

            // set up AM tower icon
            var amIcon = notifyIcon;
            if (modStation.notify() == 'dont-notify') {
              amIcon = dontNotifyIcon;
            }
            // add AM tower marker, with popup
            L.marker([curStation.decimal_lat_nad83, curStation.decimal_lon_nad83], {
              icon: amIcon,
              title: "st" + curStation.facid,
              bounceOnAdd: true,
              bounceOnAddOptions: {
                duration: 1000,
                height: 50
              }
            }).bindPopup("<strong>"+curStation.call+"</strong>").addTo(stationMap);

            // clear interval
            clearInterval(checkExist);
         }
      }, 100); // check every 100ms
    */
    }); // end each

      $.get('templates/stations.html', function(templates) {
        var template = $(templates).filter('#station-detail-new').html();
        var html = Mustache.to_html(template, stations);
        $(html).appendTo('#stations');
      });
  
    // add headings
    //$('<h4 class="notify-heading">You <span>must</span> notify the following stations:</h4><br />').prependTo("#station-notify");
    //$('<h4 class="dont-notify-heading">You are <span>not</span> required to notify following stations:</h4><br />').prependTo("#station-dont-notify");

    $('html,body').animate({
      scrollTop: $(".content").offset().top
      },
      'slow');
  } // end else
} // end function

// a station
var station = function(curStation, height) {
  // is tower directional
  var isNonDirectional = function() {
    console.log ('tower count = ' + curStation.tower_count);
    if (curStation.tower_count == 1) {
      return true;
    }
  };

  // convert kHz to MHz
  var getMHZ = function() {
    return parseFloat(curStation.frequency.replace(" kHz", "") * .001);
  };

  // convert km to meters
  var getMeters = function() {
    return parseFloat(curStation.distance.replace(" km", "") * 1000);
  };

  // get the wavelength
  var getWavelength = function() {
    return parseFloat(300 / parseFloat(getMHZ()));
  };

  // get electrical degrees
  var getEDegrees = function(height) {
    return parseFloat(parseFloat(height) / parseFloat(getWavelength()) * 360);
  };

  // should this tower be notified
  var isCritical = function() {
    var critical = 'dont-notify';
    if (isNonDirectional()) {
      if ((getWavelength() < getMeters()) && getEDegrees(height) > 60) {
        critical = 'notify';
      }
    } else {  // its directional
      if (getMeters() < getWavelength() * 10 && getMeters() < 3000 && getEDegrees(height) > 36) {
        critical = 'notify';
      }
    }
    return critical;
  };

  // public
  return {
    notify: isCritical
  };
}