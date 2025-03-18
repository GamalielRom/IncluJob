import { deleteCandidateByID, getAllStatus, getStatusByID } from "./CRUD";

async function main() {
   const candidate =  await getStatusByID(3);
   console.log(candidate);
   return candidate
}

main();