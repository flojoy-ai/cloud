import PasswordResetFields from "./pass-reset-fields";

const Page = async ({
  params,
}: {
  params: {
    token: string;
  };
}) => {
  const { token } = params;
  return <PasswordResetFields token={token} />;
};

export default Page;
