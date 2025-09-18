import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BuildsPage from "./pages/BuildsPage";
import ArmorCalculator from "./pages/ArmorCalculator";
import NewPlayerGuide from "./pages/guides/NewPlayerGuide";
import PvPGuide from "./pages/guides/PvPGuide";
import OPRHealingGuide from "./pages/guides/OPRHealingGuide";
import HiveGorgonGuide from "./pages/guides/HiveGorgonGuide";
import GoldMakingGuide from "./pages/guides/GoldMakingGuide";
import RunglassCalculator from "./pages/tools/RunglassCalculator";
import TrophyCalculator from "./pages/tools/TrophyCalculator";
import MatrixCalculator from "./pages/tools/MatrixCalculator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/calculator" element={<ArmorCalculator />} />
          <Route path="/guides/new-player" element={<NewPlayerGuide />} />
          <Route path="/guides/pvp" element={<PvPGuide />} />
          <Route path="/guides/opr-healing" element={<OPRHealingGuide />} />
          <Route path="/guides/hive-gorgon" element={<HiveGorgonGuide />} />
          <Route path="/guides/gold-making" element={<GoldMakingGuide />} />
          <Route path="/tools/runglass" element={<RunglassCalculator />} />
          <Route path="/tools/trophies" element={<TrophyCalculator />} />
          <Route path="/tools/matrix" element={<MatrixCalculator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
