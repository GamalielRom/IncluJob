import { createEmployerPayment, createJobApplication, deleteApplicationByID, deleteEmployerByID, deleteEmployerPaymentByID, editEmployerPaymentByID, getAllApplications, getAllEmployerPayments, getApplicationsByCandidateID, getApplicationsByCompany, getApplicationsByJobID, getEmployerPaymentHistory, getLastEmployerPayment} from "./CRUD";

async function main() {
   const candidate =  await getAllApplications();
   console.log(candidate);
   return candidate
}

main();