import { Suspense } from "react";
import { AuthCallbackContainer } from "@/features/auth";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContainer />
    </Suspense>
  );
}
