<script lang="ts">
  import "maplibre-gl/dist/maplibre-gl.css";
  import maplibregl from "maplibre-gl";
  import { onMount } from "svelte";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell
  } from "flowbite-svelte";
  import type { Network, Observation } from "./+page.server";
  import { MAPLIBRE_STYLE_URL } from "$lib/config";

  interface GeoJSONProperties extends Observation {
    x: number;
    y: number;
  }

  export let data: { networkData: Network; observationData: Observation[] };

  const networkLocation: [number, number] = data.networkData.location
    ? [data.networkData.location.x, data.networkData.location.y]
    : [0, 0];

  // Network properties table
  let properties = [
    ["SSID", data.networkData.ssid],
    ["BSSID / MAC", data.networkData.bssid],
    ["Type", data.networkData.type],
    ["Location", networkLocation.join(", ")]
  ];

  // Create GeoJSON for displaying on a map
  const features = data.observationData.map((obs) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [obs.position.x, obs.position.y] as [number, number]
    },
    properties: {
      ...obs,
      x: obs.position.x,
      y: obs.position.y
    } as GeoJSONProperties
  }));

  const geojson = {
    type: "FeatureCollection",
    features: features
  };

  onMount(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: MAPLIBRE_STYLE_URL,
      center: networkLocation,
      zoom: 10
    });

    // zoom and rotation controls
    map.addControl(new maplibregl.NavigationControl());

    // Add estimated network location marker
    const marker = new maplibregl.Marker().setLngLat(networkLocation).addTo(map);

    map.on("load", () => {
      map.addSource("observations", {
        type: "geojson",
        // @ts-ignore
        data: geojson
      });

      // layer to visualize the points
      map.addLayer({
        id: "observations",
        type: "circle",
        source: "observations",
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "signal"],
            -100,
            "#c44601",
            -90,
            "#f57600",
            -70,
            "#8babf1",
            -50,
            "#0073e6",
            -30,
            "#054fb9"
          ],
          "circle-stroke-color": "black",
          "circle-stroke-width": 1
        }
      });

      // Fit the map to the bounds
      const bounds = new maplibregl.LngLatBounds();
      geojson.features.forEach((feature) => {
        if (feature.geometry.type === "Point") {
          bounds.extend(feature.geometry.coordinates);
        }
      });
      map.fitBounds(bounds, {
        padding: 100
      });

      // Hover popup
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.on("mouseenter", "observations", async (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (typeof e.features === "undefined") return;

        const data = e.features[0].properties as GeoJSONProperties;
        const infoText = `Signal: ${data.signal}<br>Time: ${data.time}`;
        popup.setLngLat([data.x, data.y]).setHTML(infoText).addTo(map);
      });

      map.on("mouseleave", "observations", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });
  });
</script>

<div class="container mx-auto">
  <div class="justify-items-strech grid grid-cols-1 xl:grid-cols-2">
    <Table striped={true}>
      <TableBody tableBodyClass="divide-x">
        {#each properties as property}
          <TableBodyRow>
            <TableBodyCell>{property[0]}</TableBodyCell>
            <TableBodyCell>{property[1]}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
    <div><div id="map" /></div>
  </div>
</div>

<div class="mt-5 flex justify-center">
  <Table striped={true} class="w-screen">
    <TableHead>
      <TableHeadCell>Network ID</TableHeadCell>
      <TableHeadCell>Time</TableHeadCell>
      <TableHeadCell>SSID</TableHeadCell>
      <TableHeadCell>Signal</TableHeadCell>
      <TableHeadCell>Latitude</TableHeadCell>
      <TableHeadCell>Longitude</TableHeadCell>
      <TableHeadCell>Altitude</TableHeadCell>
      <TableHeadCell>Accuracy</TableHeadCell>
      <TableHeadCell>Capabilities</TableHeadCell>
      <TableHeadCell>Service</TableHeadCell>
      <TableHeadCell>
        <span class="sr-only">Edit</span>
      </TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each data.observationData as obs}
        <TableBodyRow>
          <TableBodyCell>{data.networkData.id}</TableBodyCell>
          <TableBodyCell>{obs.time}</TableBodyCell>
          <TableBodyCell>{obs.ssid}</TableBodyCell>
          <TableBodyCell>{obs.signal}</TableBodyCell>
          <TableBodyCell>{obs.position.x}</TableBodyCell>
          <TableBodyCell>{obs.position.y}</TableBodyCell>
          <TableBodyCell>{obs.altitude}</TableBodyCell>
          <TableBodyCell>{obs.accuracy}</TableBodyCell>
          <TableBodyCell>{obs.capabilities}</TableBodyCell>
          <TableBodyCell>{obs.service}</TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
</div>

<style>
  #map {
    height: 40rem;
    width: 100%;
  }
</style>
