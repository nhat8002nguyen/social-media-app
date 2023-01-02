import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function useForceSignIn() {
  const { data: session } = useSession();
  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      signIn("google"); // Force sign in to hopefully resolve error
    }
  }, [session]);
}
