import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import type { GetAthleteResults } from "../types/api-types";
import * as api from "../services/api-endpoints";
import { Card } from "../components/Card";

type SortBy = "date" | "time";

export const Athlete: React.FC = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const [results, setResults] = useState<Record<
    string,
    GetAthleteResults[]
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("time");
  const [athleteName, setAthleteName] = useState<string | null>(null);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState<string>("#8b5cf6");

  const fetchAthleteResults = useCallback((id: string, sort: SortBy) => {
    setLoading(true);
    setMessage("Loading athlete results...");

    api
      .getAthleteResults(Number(id), sort)
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
      fetchAthleteResults(athleteId, sortBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId, sortBy]);

  // Extract athlete name and fetch team logo from first result
  useEffect(() => {
    if (results) {
      const firstEvent = Object.keys(results)[0];
      if (firstEvent && results[firstEvent].length > 0) {
        const firstResult = results[firstEvent][0];
        setAthleteName(firstResult.athleteName);

        // Fetch team extras for logo and colors
        api
          .getTeamExtras(firstResult.teamId)
          .then((data) => {
            if (data.success && data.data) {
              if (data.data.logoUrl) {
                setTeamLogo(data.data.logoUrl);
              }
              if (data.data.primaryColor) {
                setPrimaryColor(data.data.primaryColor);
              }
              if (data.data.secondaryColor) {
                setSecondaryColor(data.data.secondaryColor);
              }
            }
          })
          .catch((error) => {
            console.error("Failed to fetch team extras:", error);
          });
      }
    }
  }, [results]);

  const sortedEvents = useMemo(() => {
    if (!results) return [];
    return Object.keys(results).sort();
  }, [results]);

  const totalRaces = useMemo(() => {
    if (!results) return 0;
    return Object.values(results).reduce((sum, races) => sum + races.length, 0);
  }, [results]);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(to bottom right, ${primaryColor}60, ${secondaryColor}30, #0f172a)`,
      }}
    >
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
          <div className="flex items-center justify-center gap-6 mb-4">
            {teamLogo && (
              <img
                src={teamLogo}
                alt="Team Logo"
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            )}
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              {athleteName || "Athlete Profile"}
            </h1>
          </div>
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
        {!loading && results && Object.keys(results).length === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
              <p className="text-blue-100 text-lg">
                No results found for this athlete.
              </p>
            </div>
          </div>
        )}

        {/* Results by Distance */}
        {!loading && results && Object.keys(results).length > 0 && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                Race Results ({totalRaces} total)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("time")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    sortBy === "time"
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-blue-200 hover:bg-white/20"
                  }`}
                >
                  Sort by Time
                </button>
                <button
                  onClick={() => setSortBy("date")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    sortBy === "date"
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-blue-200 hover:bg-white/20"
                  }`}
                >
                  Sort by Date
                </button>
              </div>
            </div>

            {/* Grouped Results */}
            {sortedEvents.map((event) => (
              <Card
                key={event}
                title={event}
                description={`${results[event].length} race${
                  results[event].length > 1 ? "s" : ""
                }`}
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
                      {results[event].map((result, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-blue-100">
                            {result.meetName}
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
            ))}
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
