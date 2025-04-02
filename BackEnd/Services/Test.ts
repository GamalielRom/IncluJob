import { createCandidateLanguage, deleteJobBookmarkByID, getEmployerIndustryByEmpID, getEmployerIndustryByIndID,editEmployerIndustry, deleteEmployerIndustry, getCandidateLanguageByCandID, getCandidateLanguageByLangID, editCandidateLanguage, deleteCandidateLanguage} from "./CRUD";

async function main() {
   const candidate =  await deleteCandidateLanguage({language_id:1, candidate_id:2});
   console.log(candidate);
   return candidate
}

main();