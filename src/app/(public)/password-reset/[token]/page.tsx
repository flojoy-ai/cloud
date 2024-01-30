import { redirect } from "next/navigation";
import { isValidPasswordResetToken } from "~/lib/token";
import PasswordResetFields from "./pass-reset-fields";

const Page = async ({
  params,
}: {
  params: {
    token: string;
  };
}) => {
  const { token } = params;
  const validToken = await isValidPasswordResetToken(token);
  if (!validToken) redirect("/password-reset");
  return <PasswordResetFields token={token} />;
};

export default Page;
