import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-5 right-5 z-50 bg-white dark:bg-gray-800 rounded-full shadow-md"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 text-gray-800 hidden dark:block" />
      <Moon className="h-5 w-5 text-gray-800 block dark:hidden" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
