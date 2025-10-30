"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// corrected relative path to reach project-level lib
import { AdminApi, type CreatorApplication } from "../../../../lib/api";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineArrowLeft,
  AiOutlineUser,
  AiOutlineTwitter,
  AiOutlineInstagram,
  AiOutlineYoutube,
} from "react-icons/ai";
import Link from "next/link";
// Import a new icon for the token
import { FaCoins } from "react-icons/fa";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // New state for the token supply input
  const [tokenSupply, setTokenSupply] = useState("");

  const applicationId = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "application", applicationId],
    queryFn: async () => {
      // We assume AdminApi is already set up to handle authentication
      const response = await AdminApi.getApplicationById(applicationId);
      return response.data.data as CreatorApplication;
    },
  });

  // Set initial state when data is loaded
  useEffect(() => {
    if (data) {
      const appData = data as CreatorApplication;
      setSelectedState(appData.state);
      // Pre-fill the token supply input with the value from the application
      setTokenSupply(appData.ico_supply?.toString() || "");
    }
  }, [data]);

  // Update state via dropdown
  const updateStateMutation = useMutation<void, any, string>({
    mutationFn: async (newState: string) => {
      await AdminApi.updateApplicationState(applicationId, newState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "application", applicationId],
      });
      setToastMessage("Application status updated");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(
        error?.response?.data?.message || "Failed to update application status"
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  // Approve application (use Approve button)
  const approveMutation = useMutation<void, any, void>({
    mutationFn: async () => {
      await AdminApi.approveApplication(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "application", applicationId],
      });
      setToastMessage("Application approved successfully!");
      setShowToast(true);
      // stay on page so admin can create token
      setTimeout(() => setShowToast(false), 2000);
    },
    onError: (error: any) => {
      setToastMessage(
        error?.response?.data?.message || "Failed to approve application"
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  // Reject application (from modal)
  const rejectMutation = useMutation<void, any, string>({
    mutationFn: async (reason: string) => {
      await AdminApi.rejectApplication(applicationId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "application", applicationId],
      });
      setShowRejectModal(false);
      setToastMessage("Application rejected successfully!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/admin/applications");
      }, 2000);
    },
    onError: (error: any) => {
      setToastMessage(
        error?.response?.data?.message || "Failed to reject application"
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  // --- MUTATION for Token Creation ---
  const createTokenMutation = useMutation<void, any, { creatorUserId: string; icoSupply: number }>({
    // AdminApi.createCreatorToken(creatorUserId: string, icoSupply: number)
    mutationFn: async (data) => {
      await AdminApi.createCreatorToken(data.creatorUserId, data.icoSupply);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data (e.g., show token exists)
      queryClient.invalidateQueries({
        queryKey: ["admin", "application", applicationId],
      });
      // refetch user data if applicable (application may be undefined at init)
      if (data?.user_id) {
        queryClient.invalidateQueries({ queryKey: ["user", (data as any).user_id] });
      }
      setToastMessage("Creator token created successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      // This will catch errors from the backend, like "Token already exists"
      setToastMessage(error?.response?.data?.message || "Failed to create token");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  const handleApprove = () => {
    if (confirm("Are you sure you want to approve this application? This will grant the user creator status but will NOT create a token.")) {
      approveMutation.mutate();
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    rejectMutation.mutate(rejectionReason);
  };

  const application = data as CreatorApplication;

  const handleStateChange = (newState: string) => {
    if (!application) return;
    // Prevent this from being used for initial approval
    if (newState === "approved" && application.state !== "approved") {
      alert("Please use the 'Approve' button for the initial approval.");
      setSelectedState(application.state); // Reset dropdown
      return;
    }

    setSelectedState(newState);
    if (
      confirm(
        `Are you sure you want to change the application state to "${newState}"?`
      )
    ) {
      updateStateMutation.mutate(newState);
    }
  };

  // --- NEW HANDLER for Token Creation ---
  const handleCreateToken = () => {
    const supply = parseInt(tokenSupply, 10);
    if (!tokenSupply || isNaN(supply) || supply <= 0) {
      alert("Please enter a valid, positive number for the token supply.");
      return;
    }

    if (
      confirm(
        `This will create a new SPL token for @${
          application.creator_handle
        } with a supply of ${supply.toLocaleString()}.\n\nThis action is irreversible. Proceed?`
      )
    ) {
      createTokenMutation.mutate({
        creatorUserId: application.user_id?.toString() || "",
        icoSupply: supply,
      });
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "kyc_pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
      case "x":
        return <AiOutlineTwitter size={20} />;
      case "instagram":
        return <AiOutlineInstagram size={20} />;
      case "youtube":
        return <AiOutlineYoutube size={20} />;
      default:
        return <AiOutlineUser size={20} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">
            Application Not Found
          </h3>
          <p className="text-red-600 text-sm mb-4">
            Unable to load the application details.
          </p>
          <Link
            href="/admin/applications"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  // Only allow approval/rejection if not already approved or rejected
  const canApproveOrReject = !["approved", "rejected"].includes(application.state);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/applications"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <AiOutlineArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-cabinet-bold text-gray-900">
                  Application Review
                </h1>
                <p className="text-gray-600 font-quicksand mt-1">
                  @{application.creator_handle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* State Update Dropdown */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Update Status</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={updateStateMutation.isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:opacity-50 bg-white"
                >
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="kyc_pending">KYC Pending</option>
                </select>
              </div>

              {/* Action Buttons */}
              {canApproveOrReject && (
                <>
                  <div className="h-12 w-px bg-gray-300"></div>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={rejectMutation.isLoading}
                    className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <AiOutlineClose size={18} />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={approveMutation.isLoading}
                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <AiOutlineCheck size={18} />
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">{application.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{application.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900 font-medium">{application.phone_number || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Creator Handle</p>
                  <p className="text-gray-900 font-medium">@{application.creator_handle}</p>
                </div>
              </div>
            </div>

            {/* Creator Profile */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Creator Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900 font-medium">{application.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-gray-900">{application.bio}</p>
                </div>
                {application.profile_picture && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Profile Picture</p>
                    <img
                      src={application.profile_picture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Social Media Presence</h2>
              <div className="space-y-3 mb-6">
                {application.social_links && application.social_links.length > 0 ? (
                  application.social_links.map((link: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-600">{getSocialIcon(link.platform)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {link.platform} - @{link.handle}
                        </p>
                        <p className="text-sm text-gray-500">{link.url}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {link.follower_count?.toLocaleString() || 0} followers
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No social media links provided</p>
                )}
              </div>
              {application.engagement_metrics && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Engagement Metrics</p>
                  <p className="text-gray-900">{application.engagement_metrics}</p>
                </div>
              )}
            </div>

            {/* Token Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Token Launch Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Token Name</p>
                  <p className="text-gray-900 font-medium">{application.token_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Token Symbol</p>
                  <p className="text-gray-900 font-medium">${application.token_symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proposed ICO Supply</p>
                  <p className="text-gray-900 font-medium">{application.ico_supply?.toLocaleString() || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Funding Goal</p>
                  <p className="text-gray-900 font-medium">
                    {application.funding_goal ? `$${application.funding_goal.toLocaleString()}` : "Not specified"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Token Pitch</p>
                <p className="text-gray-900">{application.token_pitch}</p>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Verification Documents</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Government ID</p>
                  {application.government_id_url ? (
                    <a href={application.government_id_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">
                      View Document
                    </a>
                  ) : (
                    <p className="text-gray-500">Not provided</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Content Ownership</p>
                  <p className="text-gray-900 font-medium">
                    {application.content_ownership_declared ? "✅ Declared" : "❌ Not Declared"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Timeline */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Application Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Current State</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStateColor(application.state)}`}>
                    {application.state.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="text-gray-900 font-medium">{new Date(application.submitted_at).toLocaleString()}</p>
                </div>
                {application.reviewed_at && (
                  <div>
                    <p className="text-sm text-gray-500">Reviewed</p>
                    <p className="text-gray-900 font-medium">{new Date(application.reviewed_at).toLocaleString()}</p>
                  </div>
                )}
                {application.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason</p>
                    <p className="text-red-800">{application.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* --- NEW TOKEN CREATION CARD --- */}
            {application.state === "approved" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Token Creation</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Application is approved. You can now create the creator's SPL token. The name ({application.token_name}) and symbol (${application.token_symbol}) will be pulled from the profile.
                </p>

                <div>
                  <label htmlFor="tokenSupply" className="block text-sm font-medium text-gray-700 mb-1">Token ICO Supply</label>
                  <input
                    type="number"
                    id="tokenSupply"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(e.target.value)}
                    placeholder="e.g., 1000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the total number of tokens for the initial supply.</p>
                </div>

                <button
                  onClick={handleCreateToken}
                  disabled={createTokenMutation.isLoading || !tokenSupply.trim()}
                  className="mt-5 w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaCoins size={18} />
                  {createTokenMutation.isLoading ? "Creating Token..." : "Create Creator Token"}
                </button>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-linear-to-br from-green-50 to-blue-50 rounded-xl shadow-sm p-6 border border-green-100">
              <h3 className="font-cabinet-bold text-lg mb-3">Quick Summary</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Creator:</span>
                  <span className="font-semibold">{application.full_name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-semibold">{application.token_symbol}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold">{application.category}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Social Links:</span>
                  <span className="font-semibold">{application.social_links?.length || 0}</span>
                </p>
              </div>
            </div>

            {/* Admin Actions Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-cabinet-bold text-lg mb-3">Quick Actions</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <AiOutlineCheck className="text-green-600" size={16} />
                  <span>"Approve" grants creator status.</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <AiOutlineClose className="text-red-600" size={16} />
                  <span>"Reject" declines with a reason.</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Use dropdown to update status anytime.</span>
                </div>
                {application.state === "approved" && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <p className="text-green-700 font-medium">✓ User has been granted creator role.</p>
                    <p className="text-blue-700 font-medium">→ Next step: Create their token.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-cabinet-bold text-gray-900 mb-4">Reject Application</h2>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this application. This will be shared with the creator.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                disabled={rejectMutation.isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {rejectMutation.isLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up ${
            toastMessage.includes("Failed") || toastMessage.toLowerCase().includes("error")
              ? "bg-red-600 text-white"
              : "bg-gray-900 text-white"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              toastMessage.includes("Failed") || toastMessage.toLowerCase().includes("error")
                ? "bg-white"
                : "bg-green-500"
            }`}
          ></div>
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}