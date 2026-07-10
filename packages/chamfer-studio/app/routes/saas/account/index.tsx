import { redirect } from "react-router";

export async function loader() {
  throw redirect("/account/profile");
}

export default function AccountIndex() {
  return null;
}
