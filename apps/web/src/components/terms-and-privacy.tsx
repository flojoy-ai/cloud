import { Link } from "@tanstack/react-router";

const TermsAndPrivacy = () => {
  return (
    <p className="px-8 text-center text-sm text-muted-foreground">
      By clicking continue, you agree to our{" "}
      <Link
        href="https://app.termly.io/document/terms-of-service/e7776ca7-3e93-4f6e-a492-3e3cbeba2b79"
        className="underline underline-offset-4 hover:text-primary"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="https://app.termly.io/document/privacy-policy/1f7c261c-2406-4ead-8847-ac750b4030c9"
        className="underline underline-offset-4 hover:text-primary"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
};

export default TermsAndPrivacy;
