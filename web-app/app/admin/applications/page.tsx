"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminApi, type CreatorApplication } from "@/lib/api";
import { AiOutlineEye, AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import Link from "next/link";

export default function AdminApplicationsPage() {
  const [selectedState, setSelectedState] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const response = await AdminApi.getAllApplications();
      return response.data.data;
    },
  });

  const applications = data || [];

  // Filter applications by state
  const filteredApplications =
    selectedState === "all"
      ? applications
      : applications.filter((app) => app.state === selectedState);

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

  const getStateBadge = (state: string) => {
    const label = state.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStateColor(
          state
        )}`}
      >
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Applications</h3>
          <p className="text-red-600 text-sm">
            Unable to fetch creator applications. Please check your permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-cabinet-bold text-gray-900">
                Creator Applications
              </h1>
              <p className="text-gray-600 font-quicksand mt-1">
                Review and manage creator onboarding requests
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {applications.length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-6">
            <p className="text-blue-600 text-sm font-medium">Under Review</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {applications.filter((a) => a.state === "under_review").length}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-6">
            <p className="text-green-600 text-sm font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {applications.filter((a) => a.state === "approved").length}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm p-6">
            <p className="text-red-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-900 mt-2">
              {applications.filter((a) => a.state === "rejected").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedState("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedState === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setSelectedState("pending_submission")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedState === "pending_submission"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending Submission (
              {applications.filter((a) => a.state === "pending_submission").length})
            </button>
            <button
              onClick={() => setSelectedState("under_review")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedState === "under_review"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Under Review (
              {applications.filter((a) => a.state === "under_review").length})
            </button>
            <button
              onClick={() => setSelectedState("kyc_pending")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedState === "kyc_pending"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              KYC Pending (
              {applications.filter((a) => a.state === "kyc_pending").length})
            </button>
            <button
              onClick={() => setSelectedState("approved")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedState === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approved ({applications.filter((a) => a.state === "approved").length})
            </button>
            <button
              onClick={() => setSelectedState("rejected")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                selectedState === "rejected"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected ({applications.filter((a) => a.state === "rejected").length})
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-semibold">
                              {application.creator_handle.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{application.creator_handle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.token_symbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.token_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {application.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStateBadge(application.state)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/applications/${application.id}`}
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-900"
                        >
                          <AiOutlineEye size={18} />
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
