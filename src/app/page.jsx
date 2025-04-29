
"use client";

/**
 * Mapa pastel de la facultad (Gemelo Digital).
 * No requiere tailwind.config.ts; usamos clases arbitrarias de Tailwind v4.
 */
export default function Home() {
  return (
    <section className="flex min-h-screen items-center justify-center p-6">
      {/* CONTENEDOR PRINCIPAL DEL MAPA */}
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
        <Building label="CE" pos="left-[3%] top-[4%]" />
        <Building label="D" pos="left-[38%] top-[4%]" />
        <Building label="FCAM" pos="right-[13%] top-[4%]" size="w-40 h-28" />
        <Building label="FCAM" pos="right-[4%] top-[32%]" size="w-32 h-16" />
        <Building label="LSE" pos="left-[12%] top-[33%]" />
        <Building label="LM" pos="left-[12%] top-[55%]" />
        <Building label="LEM" pos="left-[27%] top-[23%]" size="w-36 h-16" />
        <Building label="LE" pos="left-[41%] top-[23%]" size="w-36 h-16" />
        <Building label="LIC" pos="left-[55%] top-[23%]" size="w-32 h-16" />
        <Building label="LIOT" pos="left-[68%] top-[23%]" size="w-40 h-16" />

        {/* SE (cuadro rojo) */}
        <div className="absolute left-[39%] top-[39%] flex h-16 w-16 items-center justify-center rounded-md border-4 border-red-400 text-sm font-semibold text-red-500">
          SE
        </div>

        {/* A1 ─ octágono */}
        <Building
          label="A1"
          pos="left-[42%] top-[48%]"
          size="w-48 h-48"
          octagon
        />

        {/* A2 y A3 */}
        <Building label="A2" pos="right-[18%] top-[48%]" />
        <Building label="A3" pos="right-[18%] top-[63%]" />

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

function Building({ label, pos, size = "w-32 h-20", octagon = false }) {
  return (
    <div
      className={`absolute ${pos} ${size} ${
        octagon ? "clip-octagon" : "rounded-md"
      } bg-[#A9B8FF] shadow flex items-center justify-center`}
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
