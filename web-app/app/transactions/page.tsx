import Sidebar from "@/components/layout/Sidebar";
import TransactionsTable from "@/components/transactions/TransactionsTable";

export default function TransactionsPage() {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-cabinet-bold text-white mb-2">
              Transactions
            </h1>
            <p className="text-zinc-400 text-sm font-cabinet-medium">
              View and manage all your transaction history
            </p>
          </div>
          
          <TransactionsTable />
        </div>
      </div>
    </div>
  );
}
