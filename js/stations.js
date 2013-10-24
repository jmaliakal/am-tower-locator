// callback function
function stations_output(stations) {
  // removes loading screen after we get results
  $('#station-notify, #station-dont-notify').html("");

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
      $(html).hide().appendTo("#station-notify").fadeIn(1000);
    });
  } else {  // yes results
    // loop through api results
    $.each(stations.stations, function(key, curStation) {
      var modStation = new station(curStation, $("#height").val());

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

            // add proposed tower marker
            L.marker([$("#lat").val(), $("#long").val()], {
              icon: towerIcon
            }).bindPopup("<strong>YOUR TOWER.<strong>").addTo(stationMap);

            // set up am tower icon
            var amIcon = notifyIcon;
            if (modStation.notify() == 'dont-notify') {
              amIcon = dontNotifyIcon;
            }
            // add AM tower marker
            L.marker([curStation.decimal_lat_nad83, curStation.decimal_lon_nad83], {
              icon: amIcon,
              title: "st" + curStation.facid,
              bounceOnAdd: true,
              bounceOnAddOptions: {
                duration: 1000,
                height: 50
              }
            }).bindPopup("<strong>"+curStation.call+"</strong>").addTo(stationMap);

            stationMap.dragging.disable();
            stationMap.touchZoom.disable();
            stationMap.doubleClickZoom.disable();
            stationMap.scrollWheelZoom.disable();

            // clear interval
            clearInterval(checkExist);
         }
      }, 100); // check every 100ms
    }); // end each

    // add headings
    $.get('templates/stations.html', function(templates) {
      var template = $(templates).filter('#stations-notify-heading').html();
      var html = Mustache.to_html(template);
      $(html).prependTo("#station-notify");
    });

    $.get('templates/stations.html', function(templates) {
      var template = $(templates).filter('#stations-dont-notify-heading').html();
      var html = Mustache.to_html(template);
      $(html).prependTo("#station-dont-notify");
    });

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
    if (curStation.ant_mode.substring(0, 3) === "NDD") {
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