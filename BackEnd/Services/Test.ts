import { createEmployerIndustry, deleteJobBookmarkByID, getEmployerIndustryByEmpID, getEmployerIndustryByIndID,editEmployerIndustry, deleteEmployerIndustry} from "./CRUD";

async function main() {
   const candidate =  await getEmployerIndustryByEmpID(1);
   console.log(candidate);
   return candidate
}

main();