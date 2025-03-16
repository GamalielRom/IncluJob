import { createUser } from "./CRUD";

async function main() {
    await createUser({
        name: "Gama",
        email: "Gama@example.com",
        password: "securepassword",
        phone: 123456789,
        alternative_phone: 987654321,
        country: "Canada",
        role_id: 1
    });
}

main();