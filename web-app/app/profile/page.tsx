"use client";

import { useUser, useLogout } from "@/hooks/use-auth";
import { useGenerateDepositAddress } from "@/hooks/use-wallet";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { User, Mail, Calendar, Shield, LogOut, Wallet } from "lucide-react";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUser();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "wallet">("profile");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h2 className="text-2xl font-cabinet-bold text-white mb-4">Failed to load profile</h2>
          <p className="text-zinc-400">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-cabinet-bold mb-2">Profile Settings</h1>
              <p className="text-zinc-400 font-quicksand">Manage your account and preferences</p>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 rounded-lg transition font-cabinet-medium disabled:opacity-50"
            >
              {logoutMutation.isPending ? (
                <>
                  <Spinner size="sm" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-cabinet-medium ${
                    activeTab === "profile"
                      ? "bg-brand-green text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile Info</span>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-cabinet-medium ${
                    activeTab === "security"
                      ? "bg-brand-green text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </button>
                <button
                  onClick={() => setActiveTab("wallet")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-cabinet-medium ${
                    activeTab === "wallet"
                      ? "bg-brand-green text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50"
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Wallets</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {activeTab === "profile" && <ProfileTab user={user} />}
            {activeTab === "security" && <SecurityTab user={user} />}
            {activeTab === "wallet" && <WalletTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Info Tab
function ProfileTab({ user }: { user: any }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
      <h2 className="text-2xl font-cabinet-bold mb-6">Profile Information</h2>

      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-brand-green to-emerald-600 flex items-center justify-center text-3xl font-cabinet-bold">
            {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-cabinet-bold mb-1">{user.username}</h3>
            <p className="text-sm text-zinc-400 font-quicksand">
              {user.role === "creator" ? "Creator Account" : "Investor Account"}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2 font-cabinet-medium">
              <User className="w-4 h-4" />
              Username
            </label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white font-quicksand">
              {user.username}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2 font-cabinet-medium">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white font-quicksand">
              {user.email}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2 font-cabinet-medium">
              <Shield className="w-4 h-4" />
              User ID
            </label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-sm">
              {user.id}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2 font-cabinet-medium">
              <Calendar className="w-4 h-4" />
              Member Since
            </label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white font-quicksand">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Edit Profile Button (placeholder) */}
        <div className="pt-4">
          <button
            disabled
            className="px-6 py-3 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-lg font-cabinet-medium opacity-50 cursor-not-allowed"
          >
            Edit Profile (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}

// Security Tab
function SecurityTab({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password change
    alert("Password change functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
        <h2 className="text-2xl font-cabinet-bold mb-6">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2 font-cabinet-medium">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white font-quicksand focus:outline-none focus:border-brand-green transition"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2 font-cabinet-medium">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white font-quicksand focus:outline-none focus:border-brand-green transition"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2 font-cabinet-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white font-quicksand focus:outline-none focus:border-brand-green transition"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled
            className="px-6 py-3 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-lg font-cabinet-medium opacity-50 cursor-not-allowed"
          >
            Update Password (Coming Soon)
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
        <h2 className="text-2xl font-cabinet-bold mb-4">Two-Factor Authentication</h2>
        <p className="text-zinc-400 font-quicksand mb-6">
          Add an extra layer of security to your account by enabling 2FA.
        </p>

        <button
          disabled
          className="px-6 py-3 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-lg font-cabinet-medium opacity-50 cursor-not-allowed"
        >
          Enable 2FA (Coming Soon)
        </button>
      </div>

      {/* Active Sessions */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
        <h2 className="text-2xl font-cabinet-bold mb-4">Active Sessions</h2>
        <p className="text-zinc-400 font-quicksand mb-6">
          Manage your active sessions across different devices.
        </p>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-cabinet-medium text-white">Current Session</p>
              <p className="text-sm text-zinc-400 font-quicksand">
                {typeof window !== "undefined" ? window.navigator.userAgent.split("(")[1]?.split(")")[0] : "Unknown Device"}
              </p>
            </div>
            <span className="text-xs bg-brand-green/20 text-brand-green px-3 py-1 rounded-full font-cabinet-medium">
              Active Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wallet Tab
function WalletTab() {
  const chains = [
    { id: "solana", name: "Solana", currency: "SOL" },
    { id: "ethereum", name: "Ethereum", currency: "ETH" },
    { id: "bitcoin", name: "Bitcoin", currency: "BTC" },
  ];

  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>({});
  const generateMutation = useGenerateDepositAddress();

  const generateAddress = async (chain: string, currency: string) => {
    try {
      const response = await generateMutation.mutateAsync({ chain, currency });
      setDepositAddresses((prev) => ({ 
        ...prev, 
        [chain]: response.data.data.address 
      }));
    } catch (error) {
      console.error("Failed to generate address:", error);
      alert("Failed to generate deposit address. Please try again.");
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
      <h2 className="text-2xl font-cabinet-bold mb-2">Deposit Addresses</h2>
      <p className="text-zinc-400 font-quicksand mb-8">
        Generate deposit addresses for your crypto wallets.
      </p>

      <div className="space-y-4">
        {chains.map((chain) => (
          <div key={chain.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-cabinet-bold text-white">{chain.name}</h3>
                <p className="text-sm text-zinc-400 font-quicksand">{chain.currency}</p>
              </div>
              {!depositAddresses[chain.id] && (
                <button
                  onClick={() => generateAddress(chain.id, chain.currency)}
                  disabled={generateMutation.isPending}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green/80 text-white rounded-lg font-cabinet-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    "Generate Address"
                  )}
                </button>
              )}
            </div>

            {depositAddresses[chain.id] && (
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2 font-cabinet-medium">Deposit Address</p>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm text-brand-green font-mono break-all">
                    {depositAddresses[chain.id]}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(depositAddresses[chain.id]);
                      alert("Address copied to clipboard!");
                    }}
                    className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded font-cabinet-medium transition whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-400 font-quicksand">
          <strong className="font-cabinet-bold">Info:</strong> Deposit addresses are securely generated 
          using deterministic wallet derivation based on your user ID.
        </p>
      </div>
    </div>
  );
}
