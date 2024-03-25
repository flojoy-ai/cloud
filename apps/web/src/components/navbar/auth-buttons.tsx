import { siteConfig } from "@/config/site";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

const AuthButtons = () => {
  return (
    <>
      <Button size="sm" variant="outline" asChild>
        <Link to={siteConfig.links.login}>Log In</Link>
      </Button>

      <div className="px-1" />

      <Button size="sm" asChild>
        <Link to={siteConfig.links.signup}>Sign Up</Link>
      </Button>
    </>
  );
};

export default AuthButtons;
