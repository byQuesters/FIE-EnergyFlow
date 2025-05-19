"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Footer() {
  const { theme } = useTheme();
  
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container flex flex-col md:flex-row justify-between items-center py-8 px-4">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center space-x-2">
            <img 
              src="/UCOL_Icon.png" 
              alt="Logo" 
              className="h-8 w-8 opacity-80"
            />
            <h3 className="font-bold text-lg">ENERGY FLOW</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Plataforma de monitoreo y gestión de energía para la Facultad de Ingeniería Eléctrica
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-20">
          <div>
            <h4 className="font-semibold mb-3">Explorar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-foreground/80 hover:text-foreground transition-colors">
                  Documentación
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Redes</h4>
            <div className="flex space-x-2">
            <a 
                href="https://github.com/byQuesters/FIE-EnergyFlow" 
                target="_blank" 
                rel="noopener noreferrer"
              >
              <Button size="icon" variant="ghost">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
            <a 
                href="https://github.com/JDAA4" 
                target="_blank" 
                rel="noopener noreferrer"
              >
              <Button size="icon" variant="ghost">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
            </a>
            <a 
                href="https://github.com/JDAA4" 
                target="_blank" 
                rel="noopener noreferrer"
              >
              <Button size="icon" variant="ghost">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </a>
            <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => {
                  navigator.clipboard.writeText("jaguilar51@ucol.mx");
                  toast.success("¡Correo copiado!", {
                    description: "jaguilar51@ucol.mx se copió al portapapeles.",
                    icon: <Mail className="h-5 w-5 text-green-500" />,
                  });
                }}
                >
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
                </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ENERGY FLOW - Universidad de Colima. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}