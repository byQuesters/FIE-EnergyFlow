"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function Header() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-background text-foreground shadow border-b-[.3vh] border-[#ccdb94] dark:border-gray-700">
      <div className="flex items-center gap-3">
        <img src="/UCOL_Icon.png" alt="Logo UCOL" className="h-10 w-auto" />
        <span className="font-bold text-[4vh] text-[#7b8f35]">ENERGY FLOW</span>
      </div>
      <nav className="flex items-center gap-10">
        <Link href="/" className="hover:underline underline-offset-4 text-[2.3vh] text-[#7b8f35]">
          Inicio
        </Link>
        <Link href="/dashboard" className="hover:underline underline-offset-4 text-[2.3vh] text-[#7b8f35]">
          Dashboard
        </Link>
        <Link href="/about" className="hover:underline underline-offset-4 text-[2.3vh] text-[#7b8f35]">
          Acerca de
        </Link>
        <ModeToggle />
        <LogoutDialog />
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

function LogoutDialog() {
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    setOpen(false);
    signOut({ callbackUrl: "/login" });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cerrar sesión</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres cerrar sesión? Esto te llevará a la página de inicio.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>Cerrar sesión</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}