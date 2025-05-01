import {addAssistanceDeviceToDisability , getDevicesByDisabilityID, deleteDisabilityDeviceRelation } from "./CRUD";

async function main() {
   const Device =  await deleteDisabilityDeviceRelation({disability_id: 3, assistance_device_id: 3});
   console.log(Device);
   return Device
}

main();