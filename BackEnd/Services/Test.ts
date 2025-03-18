import {deleteLanguageByID, getAllLanguages} from "./CRUD";

async function main() {
   const candidate =  await getAllLanguages();
   console.log(candidate);
   return candidate
}

main();