const TermsAndPrivacy = () => {
  return (
    <p className="px-8 text-center text-sm text-muted-foreground">
      By clicking continue, you agree to our{" "}
      <a
        href="https://app.termly.io/document/terms-of-service/e7776ca7-3e93-4f6e-a492-3e3cbeba2b79"
        target="_blank"
        className="text-nowrap underline underline-offset-4 transition-all hover:text-primary"
      >
        Terms of Service
      </a>{" "}
      and{" "}
      <a
        href="https://app.termly.io/document/privacy-policy/1f7c261c-2406-4ead-8847-ac750b4030c9"
        target="_blank"
        className="text-nowrap underline underline-offset-4 transition-all hover:text-primary"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
};

export default TermsAndPrivacy;
