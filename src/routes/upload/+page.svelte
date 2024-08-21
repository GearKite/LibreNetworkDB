<script lang="ts">
  import { Label, Fileupload, Button } from "flowbite-svelte";

  let fileUploadProps = {
    id: "file",
    accept: ".sqlite",
    required: true,
    name: "file"
  };
</script>

<form method="POST" enctype="multipart/form-data">
  <Label class="pb-2" for="file">Upload file</Label>
  <Fileupload {...fileUploadProps} />
  <Button type="submit">Upload!</Button>
</form>
