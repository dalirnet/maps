var vectorSource = new ol.source.Vector();
var vectorSource1 = new ol.source.Vector();
var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  visible: false
});
var vectorLayer1 = new ol.layer.Vector({
  source: vectorSource1,
  zoom: 12
});
var typeOf = function(obj) {
  return ({}).toString.call(obj)
    .match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

function cloneObject(obj) {
  var type = typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
}
var iconStyle = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: '//openlayers.org/en/v3.8.2/examples/data/icon.png'
  }),
  text: new ol.style.Text({
    font: '12px Calibri,sans-serif',
    fill: new ol.style.Fill({
      color: '#000'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 2
    }),
    text: '66'
  })
});
var features = [];

var overlay;
var M = {
  data: {
    centerPoint: [59.5674018, 36.3140847],
    zoom: [10.51, 15.51],
    target: 'map',
    sourceUrl: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    map: {},
    viewMap: {},
    lastZoom: false
  },
  ready: function(centerPoint) {
    if (typeof centerPoint != 'undefined') {
      M.data.centerPoint = centerPoint;
    }
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    M.mapLoad();

    M.data.map.on('moveend', function(evt) {
      var currentZoom = M.data.map.getView().getZoom();
      if (!M.data.lastZoom) {
        M.data.lastZoom = currentZoom;
        return;
      }
      if ((currentZoom != M.data.lastZoom)) {
        if (currentZoom < M.data.lastZoom) {
          console.log('zoom out -> ' + currentZoom);
        } else {
          console.log('zoom in -> ' + currentZoom);
        }
      } else {
        console.log('move only');
      }
      M.data.lastZoom = currentZoom;
    });
    M.data.map.on('moveend', function(evt) {
      var ext = M.data.map.getView().calculateExtent();
      var startPoint = ol.proj.transform(ext.slice(2, 4), 'EPSG:3857', 'EPSG:4326');
      var endPint = ol.proj.transform(ext.slice(0, 2), 'EPSG:3857', 'EPSG:4326');
    });
    M.data.map.on('click', function(e) {
      var coordinate = e.coordinate;
      if (e.dragging) {
        return;
      }
      var feature = M.data.map.forEachFeatureAtPixel(M.data.map.getEventPixel(e.originalEvent), function(feature) {
        return feature;
      });
      if (feature) {

        var too = cloneObject(iconStyle);
        too.getText().setText(feature.getStyle().getText().getText() + ' -- clicked');
        feature.setStyle(too);
        overlay.setPosition(coordinate);
      }
    });

  },
  mapLoad: function() {
    M.layers.init();
    M.data.viewMap = new ol.View({
      center: ol.proj.fromLonLat(M.data.centerPoint),
      zoom: M.data.zoom[0],
      minZoom: M.data.zoom[0],
      maxZoom: M.data.zoom[1],
    });
    M.data.map = new ol.Map({
      target: M.data.target,
      interactions: [
        new ol.interaction.MouseWheelZoom({
          constrainResolution: true
        })
      ],
      layers: [
        M.layers.basic,
        vectorLayer
      ],
      overlays: [overlay],
      view: M.data.viewMap
    });
  },
  layers: {
    basic: {},
    init: function() {
      M.layers.basic = new ol.layer.Tile({
        source: new ol.source.OSM({
          url: M.data.sourceUrl
        })
      });
      var cor = [
        [6612655.713904037, 4338343.169120622, 'اول'],
      ];
      for (var i = 0; i < cor.length; i++) {
        feature = true;
        features.push(feature);
        features[i] = new ol.Feature({
          geometry: new ol.geom.Point([cor[i][0], cor[i][1]])
        });


        var too = cloneObject(iconStyle);
        too.getText().setText(cor[i][2]);
        features[i].setStyle(too);
        features[i].setId(i);
        vectorSource.addFeature(features[i]);
      }
    },
    load: function(flag) {
      var cor = [];
      if (flag == 1) {
        cor.push([6649369.958604618, 4354700.868057028, 'دوم']);
      } else if (flag == 2) {
        cor.push([6620042.0318649905, 4336044.722159844, 'سوم']);
      }

      console.log(cor);
      for (var i = 0; i < cor.length; i++) {
        feature = true;
        features.push(feature);
        features[i] = new ol.Feature({
          geometry: new ol.geom.Point([cor[i][0], cor[i][1]])
        });


        var too = cloneObject(iconStyle);
        too.getText().setText(cor[i][2]);
        features[i].setStyle(too);
        features[i].setId(i);
        vectorSource1.addFeature(features[i]);
      }
      // var source = vectorLayer.getSource();
      // var params = source.getParams();
      // params.t = new Date().getMilliseconds();
      // source.updateParams(params);
    }
  }
};
