import { deleteUserByID } from "./CRUD";

async function main() {
    await deleteUserByID(3);
}

main();