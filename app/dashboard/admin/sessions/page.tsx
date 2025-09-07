"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/hooks/use-socket";
import { RootState } from "@/lib/redux/store";

export default function AdminSessionsPage() {
  const socket = useSocket();
  const { activeSessions, isConnected, error } = useSelector(
    (state: RootState) => state.session
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Active Sessions</h1>

      {/* Connection Status */}
      <div className="mb-4">
        <span
          className={`inline-block w-3 h-3 rounded-full mr-2 ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></span>
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
        {error && <p className="text-red-500 mt-1">{error}</p>}
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeSessions.map((session) => (
                <tr key={session.socketId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.name || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {session.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(session.lastActive).toLocaleString()}
                  </td>
                </tr>
              ))}
              {activeSessions.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No active sessions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
