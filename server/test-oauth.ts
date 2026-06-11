import { auth } from "./src/auth.ts";

async function test() {
  const req = new Request("http://localhost:3001/api/auth/sign-in/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "google", callbackURL: "http://localhost:3001" })
  });
  const res = await auth.handler(req);
  console.log(res.status);
  console.log(await res.text());
}
test();
