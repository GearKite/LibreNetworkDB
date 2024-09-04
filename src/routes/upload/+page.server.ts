import { fail } from "@sveltejs/kit";
import { parseWigleDB } from "$lib/upload/parseWigleDB";

export const actions = {
  default: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());

    if (!(formData.file as File).name || (formData.file as File).name === "undefined") {
      return fail(400, {
        error: true,
        message: "You must provide a file to upload"
      });
    }

    const { file } = formData as { file: File };
    console.log(`A file of size ${file.size} has been uploaded`);

    if (file.name.endsWith(".sqlite")) parseWigleDB(file);
  }
};
