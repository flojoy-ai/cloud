"use client";
import { User } from "lucia";

import * as Sentry from "@sentry/browser";
import { useEffect } from "react";

type Props = {
  user: User | null;
};

const IdentifyUser = ({ user }: Props) => {
  useEffect(() => {
    if (user) {
      Sentry.setUser({ email: user.email });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);
  return null;
};

export default IdentifyUser;
