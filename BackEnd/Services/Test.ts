import { createStatus } from "./CRUD";

async function main() {
    await createStatus({
        payment_made: true,
        current_student: false,
        current_worker: true,
        active_candidate: false,
        applied: false,
        open_offer: true
    });
}

main();