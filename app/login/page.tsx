import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <AuthForm mode="login" />
    </main>
  );
}
