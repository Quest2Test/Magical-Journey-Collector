import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";

const Home       = lazy(() => import("@/pages/home"));
const CardsBrowse = lazy(() => import("@/pages/cards"));
const CardDetail = lazy(() => import("@/pages/card-detail"));
const DeckBuilder = lazy(() => import("@/pages/builder"));
const DecksBrowse = lazy(() => import("@/pages/decks"));
const DeckDetail = lazy(() => import("@/pages/deck-detail"));
const DeckPrint  = lazy(() => import("@/pages/deck-print"));
const Meta       = lazy(() => import("@/pages/meta"));
const MetaAnalysis = lazy(() => import("@/pages/meta-analysis"));
const Sets       = lazy(() => import("@/pages/sets"));
const SetDetail  = lazy(() => import("@/pages/set-detail"));
const Profile    = lazy(() => import("@/pages/profile"));
const AuthPage   = lazy(() => import("@/pages/auth"));
const About      = lazy(() => import("@/pages/about"));
const Privacy    = lazy(() => import("@/pages/privacy"));
// const NewsPage   = lazy(() => import("@/pages/news"));
// const ArticlePage = lazy(() => import("@/pages/article"));
// const AdminNews   = lazy(() => import("@/pages/admin-news"));
const Resources   = lazy(() => import("@/pages/resources"));
const Academy    = lazy(() => import("@/pages/academy"));
const NotFound   = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

export const LORCANA_API_BASE_URL =
  import.meta.env.VITE_LORCANA_API_BASE_URL?.replace(/\/$/, "") ??
  "https://api.lorcana-api.com";

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={AuthPage} />
            <Route path="/cards" component={CardsBrowse} />
            <Route path="/cards/:id" component={CardDetail} />
            <Route path="/cards/:id/*" component={CardDetail} />
            <Route path="/builder" component={DeckBuilder} />
            <Route path="/decks" component={DecksBrowse} />
            <Route path="/decks/:id" component={DeckDetail} />
            <Route path="/deck/:id/print" component={DeckPrint} />
            <Route path="/meta" component={Meta} />
            <Route path="/meta/:id" component={MetaAnalysis} />
            <Route path="/sets" component={Sets} />
            <Route path="/sets/:id" component={SetDetail} />
            <Route path="/profile/:username" component={Profile} />
            {/* <Route path="/news" component={NewsPage} />
            <Route path="/news/:slug" component={ArticlePage} />
            <Route path="/admin/news" component={AdminNews} /> */}
            <Route path="/resources" component={Resources} />
            <Route path="/academy" component={Academy} />
            <Route path="/about" component={About} />
            <Route path="/privacy" component={Privacy} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="lorbound-theme">
        <CurrencyProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;