// callback function
function stations_output(bgmap, stations) {
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
    // no results message
    $.get('templates/stations.html', function(templates) {
      var template = $(templates).filter('#stations-none').html();
      var html = Mustache.to_html(template);
      $('#stations').html(html);
    });
    
    // add proposed tower marker
    L.marker([$("#lat").val(), $("#long").val()], {
      icon: towerIcon
    }).bindPopup("<strong>YOUR TOWER.<strong>").addTo(bgmap);
    // reset the view
    bgmap.setView([$("#lat").val(), $("#long").val()], 9);
    // turn map back on
    $("#map").css("display", "block");
    
  } else {  // yes results
    // loop through api results and add property
    // counts for legend
    var cNotify = 0;
    var cDontNotify = 0;
    $.each(stations.stations, function(key, curStation) {
      var modStation = new station(curStation, $("#height").val());
      curStation.isCritical = modStation.notify();
      if (modStation.notify() == 'notify') {
        cNotify++;
      } else {
        cDontNotify++;
      }
    }); // end each
    
    // sort the stations to get 'notify' at top
    stations.stations.sort(compare);

    // setup legend
    if (cNotify > 0) {
      legend = '#stations-legend-notify'; // no stations to notify
    }
    if (cDontNotify > 0) {
      legend = '#stations-legend-dont-notify'; // all stations are notify
    }
    if (cNotify > 0 && cDontNotify > 0) { // mixed results
      legend = '#stations-legend-mixed';
    }
    // output the legend
    $.get('templates/stations.html', function(templates) {
      var template = $(templates).filter(legend).html();
      var html = Mustache.to_html(template);
      $(html).prependTo('#stations');
    });

    // output the sorted stations
    $.get('templates/stations.html', function(templates) {
      var template = $(templates).filter('#station-detail').html();
      var html = Mustache.to_html(template, stations);
      $(html).appendTo('#stations');
    });

    // add the maps to each station
    $.each(stations.stations, function(key, curStation) {
      // interval needed cause it's fast
      var checkExist = setInterval(function() {
        if ($('#st'+curStation.facid+'-'+curStation.hours_operation+'-map').length) {
          // set up map for a station
          var stationMap = L.mapbox.map('st'+curStation.facid+'-'+curStation.hours_operation+'-map', 'fcc.map-fd8wksyc', {zoomControl: false}).setView([$("#lat").val(), $("#long").val()], 12);
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
          if (curStation.isCritical == 'dont-notify') {
            amIcon = dontNotifyIcon;
          }

          // add AM tower marker, with popup
          L.marker([curStation.decimal_lat_nad83, curStation.decimal_lon_nad83], {
            icon: amIcon,
            title: "st" + curStation.facid
          }).bindPopup("<strong>"+curStation.call+"</strong>").addTo(stationMap);
        }
        clearInterval(checkExist);
      }, 100); // check every 100ms
    });

    $('html,body').animate({
      scrollTop: $(".content").offset().top
      },
      'slow');

    window.history.pushState('object or string', 'Title', '?lat=' + $('#lat').val() + '&long=' + $('#long').val() + '&height=' + $('#height').val());

  } // end else
} // end function

// sort function for stations
function compare(a,b) {
  if (a.isCritical > b.isCritical)
     return -1;
  if (a.isCritical < b.isCritical)
    return 1;
  return 0;
}

// a station, returns whether or not the station should be notified
var station = function(curStation, height) {
  // is tower directional
  var isNonDirectional = function() {
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
      if (getWavelength() > getMeters() && getEDegrees(height) > 60) {
        critical = 'notify';
      }
    } else {  // its directional
      if ((getWavelength() * 10) > getMeters() && getMeters() < 3000 && getEDegrees(height) > 36) {
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