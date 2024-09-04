<script lang="ts">
  import "maplibre-gl/dist/maplibre-gl.css";
  import maplibregl from "maplibre-gl";
  import { onMount } from "svelte";
  import { fetchNetworkInfo } from "$lib/networkInfo";
  import { MAPLIBRE_STYLE_URL, NETWORK_TILE_SOURCE } from "$lib/config";

  onMount(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: MAPLIBRE_STYLE_URL,
      center: [24, 56.9],
      zoom: 10
    });

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on("load", () => {
      // Add a geojson point source for the heatmap
      map.addSource("networks", {
        type: "vector",
        url: NETWORK_TILE_SOURCE
      });

      // Add the heatmap layer
      map.addLayer(
        {
          id: "networks-heat",
          type: "heatmap",
          source: "networks",
          "source-layer": "networks",
          minzoom: 0,
          maxzoom: 16,
          paint: {
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 0.01, 16, 0.1],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,172,0)",
              0.2,
              "rgb(103,169,207)",
              0.4,
              "rgb(209,229,240)",
              0.6,
              "rgb(253,219,199)",
              0.8,
              "rgb(239,138,98)",
              1,
              "rgb(178,24,43)"
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 1, 16, 4]
          }
        },
        "waterway"
      );

      // Add a circle layer for the observations
      map.addLayer(
        {
          id: "networks-point",
          type: "circle",
          source: "networks",
          "source-layer": "networks",
          minzoom: 16,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              7,
              ["interpolate", ["linear"], ["get", "magnitude"], 1, 1, 6, 4],
              16,
              ["interpolate", ["linear"], ["get", "magnitude"], 1, 5, 6, 50]
            ],
            "circle-color": [
              "case",
              ["==", ["get", "type"], "W"],
              "blue",
              ["==", ["get", "type"], "B"],
              "red",
              ["==", ["get", "type"], "E"],
              "orange",
              "black" // default color
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
            "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1]
          }
        },
        "waterway"
      );

      // Add event listeners for the point layer
      map.on("mouseenter", "networks-point", async (e) => {
        // Change the cursor style as a UI indicator
        map.getCanvas().style.cursor = "pointer";

        if (typeof e.features === "undefined") return;

        popup.setLngLat(e.lngLat).setHTML("Loading...").addTo(map);

        const networkId = e.features[0].properties.id;
        const networkType = networkTypeLookup.get(e.features[0].properties.type);
        const data = await fetchNetworkInfo(networkId);

        const infoText = `SSID: ${data.ssid}<br>BSSID: ${data.bssid}<br>
                          First seen: ${data.firstSeen}<br>Last seen: ${data.lastSeen}<br>
                          Type: ${networkType}<br>Internal ID: ${networkId}`;
        popup.setHTML(infoText);
      });

      const networkTypeLookup = new Map([
        ["W", "WiFi"],
        ["B", "Bluetooth"],
        ["E", "BLE"]
      ]);

      map.on("mouseleave", "networks-point", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });
  });
</script>

<div id="map" />

<style>
  #map {
    height: calc(100vh - 72px);
  }
</style>
