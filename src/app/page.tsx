import { redirect } from "next/navigation";

function page() {
  return redirect("/signin");
}

export default page;
