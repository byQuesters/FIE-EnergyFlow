"use client";
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

/**
 * Mapa pastel de la facultad (Gemelo Digital).
 * No requiere tailwind.config.ts; usamos clases arbitrarias de Tailwind v4.
 */
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
const { data: session, status } = useSession();

React.useEffect(() => {
  if (status === "loading") return; // espera a que cargue
  if (!session) router.push("/login"); // redirige si no hay sesión
  }, [status, session]);
  const handleBuildingClick = (buildingCode) => {
    //router.push('/dashboard');
    //Para pasar el código del edificio al dashboard: 
    router.push(`/dashboard?building=${buildingCode}`);
  };

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Asegurarse de que el componente esté montado en el cliente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Evitar renderizar contenido hasta que el cliente esté listo
    return null;
  }

  return (
    
    <section className="flex min-h-screen items-center justify-center p-6">
      <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
      <div className="relative h-[750px] w-[1200px] overflow-hidden rounded-3xl border border-green-200 bg-[#ECF8E6] shadow-xl">
      
        {/* Carretera */}
        <div className="absolute right-0 top-0 h-full w-28 bg-[#404040]">
          <div className="absolute inset-0 flex flex-col justify-between py-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="mx-auto h-4 w-2 rounded-sm bg-[#F9E79F]"
              />
            ))}
          </div>
        </div>

        {/* Camino peatonal */}
        <div className="absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 bg-gray-300" />

        {/* ------------------ EDIFICIOS ------------------ */}
        <Building label="CE" pos="left-[3%] top-[4%]"/>
        <Building label="D" pos="left-[38%] top-[4%]" onClick={() => handleBuildingClick('D')} />
        <Building label="FCAM" pos="right-[13%] top-[4%]" size="w-40 h-28"/>
        <Building label="FCAM" pos="right-[4%] top-[32%]" size="w-32 h-16"/>
        <Building label="LSE" pos="left-[12%] top-[33%]" onClick={() => handleBuildingClick('LSE')} />
        <Building label="LM" pos="left-[12%] top-[55%]" onClick={() => handleBuildingClick('LM')} />
        <Building label="LEM" pos="left-[27%] top-[23%]" size="w-36 h-16" onClick={() => handleBuildingClick('LEM')} />
        <Building label="LE" pos="left-[41%] top-[23%]" size="w-36 h-16" onClick={() => handleBuildingClick('LE')} />
        <Building label="LIC" pos="left-[55%] top-[23%]" size="w-32 h-16" onClick={() => handleBuildingClick('LIC')} />
        <Building label="LIOT" pos="left-[68%] top-[23%]" size="w-40 h-16" onClick={() => handleBuildingClick('LIOT')} />

        {/* SE (cuadro rojo) */}
        <div 
          className="absolute left-[39%] top-[39%] flex h-16 w-16 items-center justify-center rounded-md border-4 border-red-400 text-sm font-semibold text-red-500"
        >
          SE
        </div>

        {/* A1 ─ octágono */}
        <Building
          label="A1"
          pos="left-[42%] top-[48%]"
          size="w-48 h-48"
          octagon
          onClick={() => handleBuildingClick('A1')}
        />

        {/* A2 y A3 */}
        <Building label="A2" pos="right-[18%] top-[48%]" onClick={() => handleBuildingClick('A2')} />
        <Building label="A3" pos="right-[18%] top-[63%]" onClick={() => handleBuildingClick('A3')} />

        {/* ------------------ EXTRAS ------------------ */}
        <Parking pos="left-[36%] bottom-[6%]" />
        <Court pos="right-[8%] bottom-[5%]" />

        {/* Árboles */}
        {treePositions.map((p) => (
          <Tree key={p} pos={p} />
        ))}
      
      </div>
    </section>
  );
}

/* ---------- COMPONENTES ---------- */

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
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Obscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Building({ label, pos, size = "w-32 h-20", octagon = false, onClick }) {
  //Cambio de color a edificios que no son de FIE
  let buildingColor = "#A9B8FF"; //Color por defecto (azul claro)
  
  if (label === "CE") {
    buildingColor = "#FFA07A"; //Color para CE
  } else if (label === "FCAM") {
    buildingColor = "#FFD700"; //Color para FCAM
  }

  return (
    <div
      className={`absolute ${pos} ${size} ${
        octagon ? "clip-octagon" : "rounded-md"
      } shadow flex items-center justify-center cursor-pointer hover:opacity-90 transition-colors`}
      onClick={onClick}
      style={{ backgroundColor: buildingColor }}
    >
      <span className="text-white font-semibold">{label}</span>
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-[#FF6B6B] shadow" />
    </div>
  );
}

function Parking({ pos }) {
  return (
    <div
      className={`absolute ${pos} grid h-24 w-60 grid-cols-4 gap-2 rounded-md bg-[#59616F] p-2`}
    >
      {["#FEB2B2", "#FBD38D", "#90CDF4", "#C6F6D5"].map((c) => (
        <div
          key={c}
          className="h-full w-full rounded-sm shadow-inner"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function Court({ pos }) {
  return (
    <div
      className={`absolute ${pos} flex h-28 w-64 items-center justify-center rounded-md border-4 border-orange-300 bg-[#F9E3C9]`}
    >
      <span className="font-bold text-orange-700">Canchas</span>
    </div>
  );
}

function Tree({ pos }) {
  return (
    <div
      className={`absolute ${pos} h-8 w-8 rounded-full bg-[#BCEBC1] opacity-80`}
    />
  );
}

const treePositions = [
  "left-[18%] top-[9%]",
  "left-[28%] top-[45%]",
  "left-[60%] top-[10%]",
  "left-[72%] top-[40%]",
  "left-[10%] bottom-[15%]",
  "right-[25%] bottom-[18%]",
];