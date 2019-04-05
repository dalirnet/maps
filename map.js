var M = {
  data: {
    centerPoint: [59.5674018, 36.3140847],
    zoom: [12.51, 15.51],
    target: 'map',
    sourceUrl: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    style: {},
    map: {},
    viewMap: {},
    activeOverlay: false,
    priority: {
      level5: 'rgba(89, 174, 127,0.75)',
      level4: 'rgba(100, 196, 175,0.75)',
      level3: 'rgba(145, 206, 215,0.75)',
      level2: 'rgba(204, 235, 192,0.75)',
      level1: 'rgba(217, 245, 190,0.75)',
    },
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(255,255,255,0)',
        width: 1
      }),
      text: new ol.style.Text({
        font: '12px IRANSans',
        fill: new ol.style.Fill({
          color: '#000'
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 2
        })
      })
    })
  },
  ready: function(centerPoint) {
    if (typeof centerPoint != 'undefined') {
      M.data.centerPoint = centerPoint;
    }
    M.mapLoad();
    M.data.map.on('moveend', function(evt) {
      var ext = M.data.map.getView().calculateExtent();
      var startPoint = ol.proj.transform(ext.slice(2, 4), 'EPSG:3857', 'EPSG:4326');
      var endPint = ol.proj.transform(ext.slice(0, 2), 'EPSG:3857', 'EPSG:4326');
      console.log(startPoint, endPint);
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
      layers: [
        M.layers.basic,
        M.layers.tileVector
      ],
      view: M.data.viewMap
    });
    M.callEvent();
  },
  layers: {
    basic: {},
    tileVector: {},
    overlay: {},
    init: function() {
      M.layers.basic = new ol.layer.Tile({
        source: new ol.source.OSM({
          url: M.data.sourceUrl
        })
      });
      M.layers.tileVector = new ol.layer.Vector({
        source: new ol.source.Vector({
          url: '/data.php',
          format: new ol.format.GeoJSON()
        }),
        style: function(feature) {
          M.data.style.setFill(new ol.style.Fill({
            color: M.data.priority['level' + feature.get('level')]
          }));
          M.data.style.setStroke(new ol.style.Stroke({
            color: 'rgba(255,255,255,0)',
            width: 1
          }));
          M.data.style.getText().setText(feature.get('name'));
          return M.data.style;
        }
      });
    }
  },
  callEvent: function() {
    M.data.map.on('pointermove', function(e) {
      if (e.dragging) {
        return;
      }
      M.helper.overlayEvent(M.data.map.getEventPixel(e.originalEvent));
    });
  },
  helper: {
    activeFeature: function(feature) {
      feature.setStyle(function() {
        M.data.style.setFill(new ol.style.Fill({
          color: 'rgba(255,255,255,0)'
        }));
        M.data.style.setStroke(new ol.style.Stroke({
          color: M.data.priority['level' + feature.get('level')].replace('0.75', '1'),
          width: 6
        }));
        M.data.style.getText().setText(feature.get('name'));
        return M.data.style;
      });
    },
    deactiveFeature: function(feature) {
      feature.setStyle(function() {
        M.data.style.setFill(new ol.style.Fill({
          color: M.data.priority['level' + feature.get('level')]
        }));
        M.data.style.setStroke(new ol.style.Stroke({
          color: 'rgba(255,255,255,0)',
          width: 1
        }));
        M.data.style.getText().setText(feature.get('name'));
        return M.data.style;
      });
    },
    overlayEvent: function(pixel) {
      var feature = M.data.map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
      });
      if (feature) {
        if (feature != M.data.activeOverlay) {
          if (M.data.activeOverlay) {
            M.helper.deactiveFeature(M.data.activeOverlay);
            M.data.activeOverlay = false;
          }
          M.data.activeOverlay = feature;
          M.helper.activeFeature(feature);
        }
      } else if (M.data.activeOverlay) {
        M.helper.deactiveFeature(M.data.activeOverlay);
        M.data.activeOverlay = false;
      }
    }
  }
};
