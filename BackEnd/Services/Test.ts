import { deleteJobBookmarkByID} from "./CRUD";

async function main() {
   const candidate =  await deleteJobBookmarkByID(3);
   console.log(candidate);
   return candidate
}

main();