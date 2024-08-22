<script lang="ts">
  import "maplibre-gl/dist/maplibre-gl.css";
  import maplibregl from "maplibre-gl";
  import { onMount } from "svelte";

  onMount(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: "https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      center: [0, 0],
      zoom: 2
    });

    map.on("load", () => {
      map.addLayer({
        id: "observations",
        type: "circle",
        source: {
          type: "vector",
          url: "http://localhost:3000/observations"
        },
        "source-layer": "observations",
        paint: {
          "circle-color": "red"
        }
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
