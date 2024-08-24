<script lang="ts">
  import "maplibre-gl/dist/maplibre-gl.css";
  import maplibregl from "maplibre-gl";
  import { onMount } from "svelte";

  onMount(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: "https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      center: [24, 56.9],
      zoom: 10
    });

    map.on("load", () => {
      // Add a geojson point source for the heatmap
      map.addSource("networks", {
        type: "vector",
        url: "http://localhost:3000/networks"
      });

      // Add the heatmap layer
      map.addLayer(
        {
          id: "networks-heat",
          type: "heatmap",
          source: "networks",
          "source-layer": "networks",
          minzoom: 0, // Set the minimum zoom level for the heatmap
          maxzoom: 22, // Set the maximum zoom level for the heatmap
          paint: {
            "heatmap-weight": [
              "case",
              ["boolean", ["feature-state", "hover"], false], // Optional: Highlight hovered points
              1, // Weight for hovered points
              1 // Weight for all other points
            ],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 0.0001, 10000, 4],
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
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2, // Decrease the radius at zoom level 0
              22, // Adjust the maximum zoom level for the radius
              10 // Decrease the maximum radius at higher zoom levels
            ],
            "heatmap-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              16,
              1,
              22, // Adjust the maximum zoom level for the opacity
              0
            ]
          }
        },
        "waterway"
      ); // Adjust the layer placement as needed

      // Add a circle layer for the observations
      map.addLayer(
        {
          id: "networks-point",
          type: "circle",
          source: "networks",
          "source-layer": "networks",
          minzoom: 18,
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
              "interpolate",
              ["linear"],
              ["get", "magnitude"],
              1,
              "rgba(33,102,172,0)",
              2,
              "rgb(103,169,207)",
              3,
              "rgb(209,229,240)",
              4,
              "rgb(253,219,199)",
              5,
              "rgb(239,138,98)",
              6,
              "rgb(178,24,43)"
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
            "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1]
          }
        },
        "waterway"
      ); // Adjust the layer placement as needed
    });
  });
</script>

<div id="map" />

<style>
  #map {
    height: calc(100vh - 72px);
  }
</style>
