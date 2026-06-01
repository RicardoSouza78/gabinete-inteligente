import Link from "next/link";
import { ArrowRight, Settings, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/30 blur-[120px] rounded-full pointer-events-none" />

      <main className="z-10 flex flex-col items-center max-w-4xl w-full">
        <div className="glass-panel rounded-3xl p-12 w-full flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Versão 1.0 (MVP)
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl text-gradient">
            Gabinete Inteligente
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-2xl">
            Plataforma centralizada de Inteligência Política, Gestão de Mandato e Monitoramento Legislativo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
            <Link 
              href="/vereador" 
              className="group flex flex-col items-center p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-primary/50 hover:bg-zinc-800/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Smartphone className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">App do Vereador</h2>
              <p className="text-sm text-zinc-400 mb-6">Boletim diário, alertas e agenda no plenário.</p>
              <div className="flex items-center text-primary text-sm font-medium mt-auto">
                Acessar PWA <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              href="/admin" 
              className="group flex flex-col items-center p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-accent/50 hover:bg-zinc-800/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Settings className="w-12 h-12 text-accent-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Painel da Assessoria</h2>
              <p className="text-sm text-zinc-400 mb-6">Motor de IA, Dossiês, Media Room e Fontes.</p>
              <div className="flex items-center text-accent-foreground text-sm font-medium mt-auto">
                Acessar Admin <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
