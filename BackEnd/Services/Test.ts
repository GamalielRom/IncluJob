import { createEmployerPayment, deleteEmployerByID, deleteEmployerPaymentByID, editEmployerPaymentByID, getAllEmployerPayments, getEmployerPaymentHistory, getLastEmployerPayment} from "./CRUD";

async function main() {
   const candidate =  await getAllEmployerPayments();
   console.log(candidate);
   return candidate
}

main();