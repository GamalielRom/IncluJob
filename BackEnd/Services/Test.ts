import {createEmployer, deleteEmployerByID, deleteIndustryByID, editEmployerByID, getaAllEmployers, getCandidateByID, getEmployerByID} from "./CRUD";

async function main() {
   const candidate =  await getaAllEmployers();
   console.log(candidate);
   return candidate
}

main();