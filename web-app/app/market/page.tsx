import Sidebar from "@/components/layout/Sidebar";
import MarketList from "@/components/market/MarketList";
import { getTickers } from "@/lib/httpClient";
import { Ticker } from "@/lib/types";

export default async function MarketPage() {
  // Fetch tickers on the server
  let tickers: Ticker[] = [];
  let error = null;

  try {
    tickers = await getTickers();
  } catch (e) {
    console.error("Failed to fetch tickers:", e);
    error = "Failed to load market data. Please check if the backend is running.";
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-cabinet-bold text-white mb-2">Market</h1>
            <p className="text-zinc-400 text-sm font-cabinet-medium">
              Global market overview — prices, 24h change and volume
            </p>
          </div>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <p className="text-red-400 font-cabinet-medium">{error}</p>
            </div>
          ) : (
            <MarketList initialTickers={tickers} />
          )}
        </div>
      </div>
    </div>
  );
}
