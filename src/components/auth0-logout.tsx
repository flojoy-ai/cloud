"use client";

import { useRouter } from "next/navigation";

const Auth0Logout = ({
  children,
  action,
  clientId,
  appDomain,
}: {
  children: React.ReactNode;
  action: string;
  clientId: string;
  appDomain: string;
}) => {
  const router = useRouter();

  return (
    <form
      action={action}
      method="post"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const response = await fetch(action, {
          method: "POST",
          body: formData,
          redirect: "manual",
        });

        const returnTo = window.location.origin;

        if (response.status === 0) {
          router.push(
            `${appDomain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`,
          );
        }
      }}
    >
      {children}
    </form>
  );
};

export default Auth0Logout;
