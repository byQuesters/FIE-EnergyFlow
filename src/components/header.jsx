"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-background text-foreground shadow">
      <div className="flex items-center gap-3">
        <img src="/UCOL_Icon.png" alt="Logo UCOL" className="h-10 w-10" />
        <span className="font-bold text-xl">ENERGY FLOW</span>
      </div>
      <nav className="flex items-center gap-6">
        <Link href="/" className="hover:underline underline-offset-4">
          Inicio
        </Link>
        <Link href="/dashboard" className="hover:underline underline-offset-4">
          Dashboard
        </Link>
        <Link href="/about" className="hover:underline underline-offset-4">
          Acerca de
        </Link>
        <ModeToggle />
      </nav>
    </header>
  );
}

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Oscuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}