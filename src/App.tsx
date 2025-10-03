import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Builds from "./pages/Builds";
import Database from "./pages/Database";
import ItemDetail from "./pages/ItemDetail";
import PerkDetail from "./pages/PerkDetail";
import DatabaseEntityDetail from "./pages/DatabaseEntityDetail";
import ArmorWeightCalculator from "./pages/ArmorWeightCalculator";
import RunglassCalculator from "./pages/RunglassCalculator";
import TrophyCalculator from "./pages/TrophyCalculator";
import MatrixCalculator from "./pages/MatrixCalculator";
import SkillBuilder from "./pages/SkillBuilder";
import NewPlayerGuide from "./pages/guides/NewPlayerGuide";
import EndGameGuide from "./pages/guides/EndGameGuide";
import PvPGuide from "./pages/guides/PvPGuide";
import OPRHealingGuide from "./pages/guides/OPRHealingGuide";
import HiveOfGorgonGuide from "./pages/guides/HiveOfGorgonGuide";
import UltimateGoldMakingGuide from "./pages/guides/UltimateGoldMakingGuide";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ResourceMap from "./pages/ResourceMap";
import SkillBuilder from "./pages/SkillBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-world-builds" element={<Builds />} />
          <Route path="/new-world-database" element={<Database />} />
          <Route path="/new-world-database/item/:itemId" element={<ItemDetail />} />
          <Route path="/new-world-database/perk/:perkId" element={<PerkDetail />} />
          <Route path="/new-world-database/:categoryId/:entityId" element={<DatabaseEntityDetail />} />
          
          {/* Guide Routes */}
          <Route path="/guides/new-world-new-player-guide" element={<NewPlayerGuide />} />
          <Route path="/guides/new-world-end-game" element={<EndGameGuide />} />
          <Route path="/guides/new-world-pvp-guide" element={<PvPGuide />} />
          <Route path="/guides/new-world-opr-healing-guide" element={<OPRHealingGuide />} />
          <Route path="/guides/new-world-hive-of-gorgon-guide" element={<HiveOfGorgonGuide />} />
          <Route path="/guides/new-world-ultimate-gold-making-guide" element={<UltimateGoldMakingGuide />} />
          
          {/* Tool Routes */}
          <Route path="/tools/new-world-armor-weight-calculator" element={<ArmorWeightCalculator />} />
          <Route path="/tools/new-world-runeglass" element={<RunglassCalculator />} />
          <Route path="/tools/new-world-trophies" element={<TrophyCalculator />} />
          <Route path="/tools/new-world-skill-builder" element={<SkillBuilder />} />
          <Route path="/tools/new-world-matrix" element={<MatrixCalculator />} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Resource Map Route */}
          <Route path="/resource-map" element={<ResourceMap />} />
          
          {/* Skill Builder Route */}
          <Route path="/skill-builder" element={<SkillBuilder />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
