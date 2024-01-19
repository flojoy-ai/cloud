import Form from "~/components/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const LoginForm = () => {
  return (
    <Form action="/api/signup">
      <Label htmlFor="email">Email</Label>
      <Input name="email" id="email" />
      <div className="py-1"></div>
      <Label htmlFor="password">Password</Label>
      <Input type="password" name="password" id="password" />
      <div className="py-1"></div>
      <Button className="w-full" type="submit">
        Log In
      </Button>
    </Form>
  );
};

export default LoginForm;
