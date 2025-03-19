import {deleteLanguageByID, createCandidate, editEducationByID, getAllEducations, getEducationByID} from "./CRUD";

async function main() {
   const candidate =  await getAllEducations();
   console.log(candidate);
   return candidate
}

main();