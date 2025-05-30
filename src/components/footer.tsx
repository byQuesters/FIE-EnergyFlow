"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Footer() {
  const { theme } = useTheme();
  
  // Estilo personalizado para los botones
  const customButtonClass = `
    center flex items-center justify-center
    bg-[#ccdb94] border-2 border-[#a3bf42] 
    text-[#7b8f35] font-bold 
    hover:bg-[#a3bf42] hover:border-[#5f5ea3] 
    hover:text-[#5f5ea3] hover:shadow-lg 
    transition-all duration-300
    rounded-lg p-2 m-1
    h-10 w-10  // Tamaño fijo para iconos
  `;
  
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center py-8 px-4 gap-8 text-center">
        {/* Logo y descripción - Centrado */}
        <div className="flex flex-col items-center space-y-4 max-w-2xl">
          <div className="flex items-center space-x-3">
            <img 
              src="/UCOL_Icon.png" 
              alt="Logo UCOL" 
              className="w-16 h-16 object-contain opacity-90"
            />
            <h3 className="font-bold text-2xl text-primary dark:text-primary-foreground">
              ENERGY FLOW
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Plataforma de monitoreo y gestión de energía para la Facultad de Ingeniería Eléctrica
          </p>
          <p className="text-xs text-muted-foreground/70">
            Proyecto desarrollado por estudiantes de la Universidad de Colima
          </p>
        </div>
        
        {/* Enlaces - Centrados en columnas */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-12 w-full max-w-4xl">
          {/* Explorar */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Explorar
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Soporte */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Soporte
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link 
                  href="/docs" 
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Documentación
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Redes sociales */}
          <div className="space-y-3 flex flex-col items-center sm:items-start">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Conéctate
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              <a 
                href="https://github.com/byQuesters/FIE-EnergyFlow" 
                target="_blank" 
                rel="noopener noreferrer"
                className={customButtonClass}
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              
              <a 
                href="https://instagram.com/ucol.mx" 
                target="_blank" 
                rel="noopener noreferrer"
                className={customButtonClass}
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              
              <a 
                href="https://linkedin.com/school/universidaddecolima/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={customButtonClass}
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              
              <button
                className={customButtonClass}
                onClick={() => {
                  navigator.clipboard.writeText("jaguilar51@ucol.mx");
                  toast.success("Correo copiado", {
                    description: "jaguilar51@ucol.mx se copió al portapeles",
                    position: "top-center",
                    duration: 2000,
                  });
                }}
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </button>
            </div>
            
            <div className="pt-2 text-center sm:text-left">
              <p className="text-xs text-muted-foreground/70">
                Facultad de Ingeniería Eléctrica
              </p>
              <p className="text-xs text-muted-foreground/70">
                Universidad de Colima
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright - Centrado */}
      <div className="border-t border-border py-4">
        <div className="container flex flex-col items-center gap-2 px-4">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} ENERGY FLOW - Proyecto académico. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground/60">
            v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
          </p>
        </div>
      </div>
    </footer>
  );
}