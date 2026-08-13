import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-kn-dark">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-3xl font-extrabold text-white">
            The <span className="bg-kn-red px-1.5 py-0.5 rounded-sm">KN</span> News
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            “दूरगामी सोच” — Admin Dashboard
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-lg font-extrabold mb-4">Login</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
