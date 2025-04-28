import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle } from "react-icons/si";

interface GoogleAuthButtonProps {
  mode: "signin" | "signup";
  className?: string;
}

export function GoogleAuthButton({ mode, className = "" }: GoogleAuthButtonProps) {
  const { toast } = useToast();

  const handleGoogleAuth = () => {
    // Redirect to Google OAuth flow
    window.location.href = "/api/auth/google";
  };

  return (
    <Button
      variant="outline"
      type="button"
      className={`w-full ${className}`}
      onClick={handleGoogleAuth}
    >
      <SiGoogle className="mr-2 h-4 w-4" />
      {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
    </Button>
  );
}