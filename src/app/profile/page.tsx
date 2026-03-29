import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileClientWrapper } from "./ProfileClientWrapper";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const primaryEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || "";
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const phone = user?.phoneNumbers?.[0]?.phoneNumber || "";

  return (
    <ProfileClientWrapper 
      clerkUserId={userId}
      email={primaryEmail}
      firstName={firstName}
      lastName={lastName}
      phone={phone}
    />
  );
}