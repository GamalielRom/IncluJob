import { createJobOfferDisability, deleteJobOfferDisability, editJobOfferDisability, getJobOfferDisabilityByDisabilityID, getJobOfferDisabilityByOfferID } from "./CRUD";

async function main() {
   const candidate =  await deleteJobOfferDisability({job_offer_id:1, disability_id:6});
   console.log(candidate);
   return candidate
}

main();