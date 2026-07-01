import { Routes, Route, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import HomeDashboard from "@/components/home/HomeDashboard";
import MatchesPage from "@/pages/MatchesPage";
import MatchDetailPage from "@/pages/MatchDetailPage";
import LivePage from "@/pages/LivePage";
import StandingsPage from "@/pages/StandingsPage";
import BracketPage from "@/pages/BracketPage";

function AppLayout() {
  const { pathname } = useLocation();
  const isBracket = pathname.startsWith("/bracket");

  return (
    <div className="antialiased min-h-screen bg-[#0b0f1a] text-white">
      <Header />
      <main
        className={
          isBracket
            ? "w-full max-w-none mx-0 px-0 sm:px-2 lg:px-4 pt-2 sm:pt-3 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-3 flex flex-col min-h-0 h-[calc(100dvh-3rem)] overflow-hidden"
            : "max-w-2xl mx-auto px-4 pt-4 sm:pt-6 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-8"
        }
      >
        <div className={isBracket ? "flex flex-col flex-1 min-h-0 w-full" : "contents"}>
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/bracket" element={<BracketPage />} />
          </Routes>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
