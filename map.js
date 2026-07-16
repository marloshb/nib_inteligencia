// map.js
import Map from "https://js.arcgis.com/4.29/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.29/@arcgis/core/views/MapView.js";
import GraphicsLayer from "https://js.arcgis.com/4.29/@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "https://js.arcgis.com/4.29/@arcgis/core/Graphic.js";
import Polyline from "https://js.arcgis.com/4.29/@arcgis/core/geometry/Polyline.js";
import CIMSymbol from "https://js.arcgis.com/4.29/@arcgis/core/symbols/CIMSymbol.js";

import { eventBus } from './eventBus.js';

export function initializeMap() {
  const map = new Map({
    basemap: "dark-gray-vector"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-20, 10], // Atlântico Central
    zoom: 3,
    ui: { components: [] } // Remove controles padrão para estética limpa
  });

  const flowLayer = new GraphicsLayer();
  map.add(flowLayer);

  // Rota Mockada: Xangai -> Santos
  const routeGeom = new Polyline({
    paths: [
      [
        [121.47, 31.23], 
        [20.0, -10.0],   
        [-46.33, -24.0]  
      ]
    ],
    spatialReference: { wkid: 4326 }
  });

  function getFlowSymbol(offset, isAlert = false) {
    const strokeColor = isAlert ? [255, 170, 0, 255] : [0, 255, 255, 255];
    const glowColor = isAlert ? [255, 170, 0, 50] : [0, 255, 255, 50];

    return new CIMSymbol({
      data: {
        type: "CIMSymbolReference",
        symbol: {
          type: "CIMLineSymbol",
          symbolLayers: [
            {
              type: "CIMSolidStroke",
              enable: true,
              width: 3,
              color: strokeColor,
              pattern: {
                type: "CIMDashPattern",
                dashTemplate: [15, 30],
                dashOffset: offset
              }
            },
            {
              type: "CIMSolidStroke",
              enable: true,
              width: 1.5,
              color: glowColor
            }
          ]
        }
      }
    });
  }

  const routeGraphic = new Graphic({
    geometry: routeGeom,
    symbol: getFlowSymbol(0, false),
    attributes: { routeId: "RT-884", alertStatus: false }
  });
  
  flowLayer.add(routeGraphic);

  let currentOffset = 0;
  const animationSpeed = 0.5;

  function animateRoutes() {
    currentOffset -= animationSpeed;
    if (currentOffset <= -45) currentOffset = 0;
    routeGraphic.symbol = getFlowSymbol(currentOffset, routeGraphic.attributes.alertStatus);
    requestAnimationFrame(animateRoutes);
  }

  view.when(() => {
    animateRoutes();
  });

  // Reação ao Barramento de Eventos
  eventBus.subscribe('NOVO_ALERTA_IA', (payload) => {
    if (payload.id_evento === "RT-884") {
      routeGraphic.attributes.alertStatus = true;
    }
  });
}
