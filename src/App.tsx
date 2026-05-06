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
import Home from "@/pages/home";
import { MetaTags } from "@/components/layout/MetaTags";
import { Analytics } from "@vercel/analytics/react";

const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // Return a promise that never resolves so React Suspense keeps showing fallback until reload happens
        return new Promise<any>(() => { });
      }
      throw error;
    }
  });

const CardsBrowse = lazyWithRetry(() => import("@/pages/cards"));
const CardDetail = lazyWithRetry(() => import("@/pages/card-detail"));
const DeckBuilder = lazyWithRetry(() => import("@/pages/builder"));
const DecksBrowse = lazyWithRetry(() => import("@/pages/decks"));
const PublicDecks = lazyWithRetry(() => import("@/pages/public-decks"));
const DeckDetail = lazyWithRetry(() => import("@/pages/deck-detail"));
const DeckPrint = lazyWithRetry(() => import("@/pages/deck-print"));
const Meta = lazyWithRetry(() => import("@/pages/meta"));
const MetaAnalysis = lazyWithRetry(() => import("@/pages/meta-analysis"));
const Sets = lazyWithRetry(() => import("@/pages/sets"));
const SetDetail = lazyWithRetry(() => import("@/pages/set-detail"));
const Profile = lazyWithRetry(() => import("@/pages/profile"));
const AuthPage = lazyWithRetry(() => import("@/pages/auth"));
const AuthCallback = lazyWithRetry(() => import("@/pages/auth-callback"));
const About = lazyWithRetry(() => import("@/pages/about"));
const Privacy = lazyWithRetry(() => import("@/pages/privacy"));
// const NewsPage   = lazyWithRetry(() => import("@/pages/news"));
// const ArticlePage = lazyWithRetry(() => import("@/pages/article"));
// const AdminNews   = lazyWithRetry(() => import("@/pages/admin-news"));
const Resources = lazyWithRetry(() => import("@/pages/resources"));
const Academy = lazyWithRetry(() => import("@/pages/academy"));
const Wishlist = lazyWithRetry(() => import("@/pages/wishlist"));
const NotFound = lazyWithRetry(() => import("@/pages/not-found"));

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
      <MetaTags />
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={AuthPage} />
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/cards" component={CardsBrowse} />
            <Route path="/cards/:id" component={CardDetail} />
            <Route path="/cards/:id/*" component={CardDetail} />
            <Route path="/builder" component={DeckBuilder} />
            <Route path="/decks" component={DecksBrowse} />
            <Route path="/public-decks" component={PublicDecks} />
            <Route path="/decks/public/:id" component={DeckDetail} />
            <Route path="/decks/:id" component={DeckDetail} />
            {/* <Route path="/deck/:id/print" component={DeckPrint} /> */}
            <Route path="/meta" component={Meta} />
            <Route path="/meta/:id" component={MetaAnalysis} />
            <Route path="/sets" component={Sets} />
            <Route path="/sets/:id" component={SetDetail} />
            <Route path="/wishlist" component={Wishlist} />
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
                <Analytics />
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;