<script lang="ts">
  import { page } from "$app/stores";

  import {
    Label,
    Button,
    Input,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell
  } from "flowbite-svelte";

  let bssid = $page.url.searchParams.get("bssid") || "";
  let ssid = $page.url.searchParams.get("ssid") || "";
  let results: any = null;

  async function handleSubmit(event: Event) {
    const formData = new FormData(event.target as HTMLFormElement);
    const response = await fetch("/api/v0/search?" + new URLSearchParams(formData));

    if (response.ok) {
      results = await response.json();
    } else {
      console.error("Error fetching search results");
    }
  }
</script>

<form on:submit={handleSubmit}>
  <Label for="bssid-input" class="mb-2 block">BSSID (MAC address)</Label>
  <Input id="bssid-input" placeholder="00:00:00:00:00" name="bssid" bind:value={bssid} />

  <Label for="ssid-input" class="mb-2 block">SSID</Label>
  <Input id="ssid-input" placeholder="my wireless wlan" name="ssid" bind:value={ssid} />

  <Button type="submit">Search</Button>
</form>

{#if results}
  <Table striped={true}>
    <TableHead>
      <TableHeadCell>ID</TableHeadCell>
      <TableHeadCell>BSSID</TableHeadCell>
      <TableHeadCell>SSID</TableHeadCell>
      <TableHeadCell>Type</TableHeadCell>
      <TableHeadCell>Location</TableHeadCell>
      <TableHeadCell>
        <span class="sr-only">Edit</span>
      </TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each results as result}
        <TableBodyRow>
          <TableBodyCell
            ><a
              href="/network?i={result.id}"
              class="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >View {result.id}</a
            ></TableBodyCell
          >
          <TableBodyCell>{result.bssid}</TableBodyCell>
          <TableBodyCell>{result.ssid}</TableBodyCell>
          <TableBodyCell>{result.type}</TableBodyCell>
          <TableBodyCell
            >{result.location ? `${result.location.y}, ${result.location.x}` : "?"}</TableBodyCell
          >
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
{/if}
