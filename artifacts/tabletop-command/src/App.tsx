import { type ReactNode } from 'react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Console from '@/pages/console';
import Display from '@/pages/display';
import NotFound from '@/pages/not-found';
import { ErrorBoundary } from '@/components/error-boundary';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Console} />
        <Route path="/display" component={Display} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

export default function App() {
  const requestedView = new URLSearchParams(window.location.search).get('view');
  const desktopView =
    requestedView === 'display' ||
    requestedView === 'moderator' ||
    (window.location.protocol === 'file:' && requestedView === null)
      ? requestedView === 'display'
        ? 'display'
        : 'moderator'
      : null;
  const browserBase =
    import.meta.env.BASE_URL === './'
      ? ''
      : import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <QueryClientProvider client={queryClient}>
      {desktopView === 'display' ? (
        <ErrorBoundary FallbackComponent={DesktopErrorFallback} resetKey={desktopView}>
          <Display />
        </ErrorBoundary>
      ) : desktopView === 'moderator' ? (
        <ErrorBoundary FallbackComponent={DesktopErrorFallback} resetKey={desktopView}>
          <Console />
        </ErrorBoundary>
      ) : (
        <WouterRouter base={browserBase}>
          <Router />
        </WouterRouter>
      )}
    </QueryClientProvider>
  );
}

function DesktopErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-8 font-sans">
      <section className="w-full max-w-2xl rounded-xl border border-red-500/40 bg-card p-8 shadow-2xl">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-red-400">
          Renderer recovery
        </p>
        <h1 className="mt-3 text-3xl font-display font-bold">
          Moderator console could not load
        </h1>
        <p className="mt-4 text-white/70">
          The application is running, but this window hit an error while loading.
          Try again, or restart Tabletop Command Center.
        </p>
        <pre className="mt-6 overflow-auto rounded-md border border-white/10 bg-black/30 p-4 text-xs text-red-200">
          {error.message || String(error)}
        </pre>
        <button
          type="button"
          onClick={() => {
            resetError();
            window.location.reload();
          }}
          className="mt-6 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Reload window
        </button>
      </section>
    </main>
  );
}
