import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import type { GetAthleteResults } from "../types/api-types";
import * as api from "../services/api-endpoints";
import { Card } from "../components/Card";

export const Athlete: React.FC = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const [results, setResults] = useState<GetAthleteResults[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAthleteResults = useCallback((id: string) => {
    setLoading(true);
    setMessage("Loading athlete results...");

    api
      .getAthleteResults(id)
      .then((data) => {
        if (data.success && data.data) {
          setResults(data.data);
          setMessage("");
        } else {
          setMessage(data.message || "Failed to load athlete results");
          setResults(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Athlete results error:", error);
        setMessage("API not reachable");
        setResults(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (athleteId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAthleteResults(athleteId);
    }
  }, [athleteId, fetchAthleteResults]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-blue-200 transition-colors bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12 pt-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Athlete Profile
          </h1>
          <p className="text-xl text-blue-200">Performance History</p>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-400 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-blue-200 text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {!loading && message && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-6 text-center">
              <p className="text-red-200 text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && results && results.length === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
              <p className="text-blue-100 text-lg">
                No results found for this athlete.
              </p>
            </div>
          </div>
        )}

        {/* Results Table */}
        {!loading && results && results.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <Card
              title="Race Results"
              description={`${results.length} race${results.length > 1 ? "s" : ""} on record`}
              accentColor="bg-blue-400"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Meet
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Event
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Place
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Team
                      </th>
                      <th className="px-4 py-3 text-left text-white font-semibold">
                        Gender
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-blue-100">
                          {result.meetName}
                        </td>
                        <td className="px-4 py-3 text-blue-100">
                          {result.event}
                        </td>
                        <td className="px-4 py-3 text-white font-semibold">
                          {result.time}
                        </td>
                        <td className="px-4 py-3 text-blue-100">
                          {result.place}
                        </td>
                        <td className="px-4 py-3 text-blue-100">
                          {result.teamName}
                        </td>
                        <td className="px-4 py-3 text-blue-100">
                          {result.gender}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16">
          <p className="text-blue-300/60 text-sm">
            © 2026 Anton Michna. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};
