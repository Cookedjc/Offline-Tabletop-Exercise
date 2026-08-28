import { useExerciseStore } from '@/store/exercise';
import { useTimer } from '@/hooks/use-timer';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function Display() {
  const { state } = useExerciseStore();
  const timer = useTimer(state);

  const activePublicInjects = state.injects.filter(
    i => i.status === 'active' && i.type === 'public'
  );

  return (
    <div className="relative min-h-screen bg-[#020617] text-foreground overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '48px 48px' }} 
      />

      {/* Main Content */}
      <div className="relative z-10 p-12 h-full flex flex-col min-h-screen">
        
        {/* Header / Timer */}
        <header className="flex flex-col items-center justify-center mb-16 pt-8">
          <div className="flex items-center gap-4 text-primary mb-6 animate-pulse">
            <ShieldAlert className="w-12 h-12" />
            <h1 className="font-display font-bold text-4xl tracking-[0.2em] uppercase">Operations Center</h1>
          </div>
          
          <div className="font-mono text-[14rem] leading-none font-bold tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] tabular-nums">
            {timer.formatted}
          </div>
          
          <div className="mt-8 text-5xl font-display font-medium text-primary tracking-widest uppercase bg-primary/10 px-8 py-4 rounded-xl border border-primary/20">
            {state.phase}
          </div>
        </header>

        {/* Active Injects Area */}
        <main className="flex-1 flex flex-col items-center max-w-7xl mx-auto w-full">
          {activePublicInjects.length > 0 ? (
            <div className="w-full">
              <h2 className="text-2xl font-mono text-muted-foreground uppercase tracking-widest mb-8 border-b border-border/50 pb-4 text-center">
                Active Intelligence
              </h2>
              <div className="grid grid-cols-1 gap-8">
                {activePublicInjects.map(inject => (
                  <div key={inject.id} className="bg-card/80 border-l-8 border-primary rounded-r-2xl p-10 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary/10 px-6 py-2 rounded-bl-2xl font-mono text-primary font-bold text-lg">
                      {inject.deployedAt ? new Date(inject.deployedAt).toLocaleTimeString() : ''}
                    </div>
                    <h3 className="text-4xl font-display font-bold mb-6 text-white pr-32 leading-tight">{inject.title}</h3>
                    <p className="text-3xl text-muted-foreground leading-relaxed font-sans">{inject.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-5xl text-center">
                <p className="text-xl font-mono uppercase tracking-[0.35em] text-primary/70 mb-8">Initial Situation</p>
                <p className="text-4xl md:text-5xl leading-relaxed text-white/85 font-display">
                  {state.publicBriefing}
                </p>
                <p className="mt-14 text-xl font-mono tracking-widest uppercase text-white/30">
                  Monitoring internal systems...
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Theatrical Overlays */}
      {state.effect === 'alarm' && (
        <div className="fixed inset-0 z-50 pointer-events-none animate-alarm mix-blend-screen" />
      )}
      
      {state.effect === 'wrong-assumption' && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-black/90 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
          <div className="text-center animate-glitch scale-125">
            <div className="text-warning mb-12 flex justify-center">
              <AlertTriangle className="w-48 h-48 drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]" />
            </div>
            <h1 className="text-[10rem] font-display font-black text-warning leading-[0.85] tracking-tighter uppercase drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]">
              CRITICAL<br/>WARNING
            </h1>
            <p className="mt-12 text-5xl font-mono text-white tracking-[0.2em] font-bold">
              INCORRECT ASSUMPTION DETECTED
            </p>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {state.status === 'paused' && state.effect === 'none' && (
        <div className="fixed inset-0 z-40 pointer-events-none bg-black/70 backdrop-blur-md flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-[8rem] font-display font-black text-white/80 tracking-[0.2em] uppercase">PAUSED</h2>
            <p className="text-3xl font-mono text-primary tracking-widest mt-8">EXERCISE SUSPENDED BY COMMAND</p>
          </div>
        </div>
      )}

    </div>
  );
}
