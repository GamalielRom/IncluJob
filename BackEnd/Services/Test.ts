import {deleteIndustryByID} from "./CRUD";

async function main() {
   const candidate =  await deleteIndustryByID(3);
   console.log(candidate);
   return candidate
}

main();