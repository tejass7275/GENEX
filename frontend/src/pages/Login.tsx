import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { user, loginWithGoogle } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <h1>Sign in</h1>
      <p className="lead">
        Sign in with Google to register content. We create a wallet for you automatically, so you
        don't need MetaMask or any crypto.
      </p>
      <div className="card">
        <GoogleLogin
          onSuccess={async (res) => {
            try {
              if (!res.credential) throw new Error("Google did not return a credential.");
              await loginWithGoogle(res.credential);
              nav("/dashboard");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
          onError={() => setError("Google sign-in failed. Try again.")}
        />
        {error && <p className="err">{error}</p>}
      </div>
    </>
  );
}
