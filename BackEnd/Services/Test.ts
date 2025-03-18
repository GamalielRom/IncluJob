import { deleteCandidateByID } from "./CRUD";

async function main() {
   const candidate =  await deleteCandidateByID(1);
   console.log(candidate);
   return candidate
}

main();