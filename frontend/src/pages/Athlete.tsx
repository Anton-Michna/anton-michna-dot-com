import { useState, useEffect, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import type { GetAthleteResults } from "../types/api-types";
import * as api from "../services/api-endpoints";
import { Card } from "../components/Card";
import { Background } from "../components/Background";
import { getContrastText } from "../utils/color";

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
  const [primaryColor, setPrimaryColor] = useState<string>("#22d3ee");
  const [secondaryColor, setSecondaryColor] = useState<string>("#8b7cf6");

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
    <div className="min-h-screen w-full">
      <Background primaryColor={primaryColor} secondaryColor={secondaryColor} />
      {/* Back to search */}
      <div className="fixed top-4 right-4 z-50">
        <Link to="/" className="sb-btn px-4 py-2 text-sm">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Search
        </Link>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-20 md:py-24">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-5">
            {teamLogo && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white p-2 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.7)] md:h-20 md:w-20">
                <img
                  src={teamLogo}
                  alt="Team Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <h1 className="font-display text-4xl leading-none font-black tracking-tight text-ink uppercase md:text-6xl">
              {athleteName || "Athlete Profile"}
            </h1>
          </div>
          <p
            className="mt-5 inline-flex items-center rounded border px-4 py-1 font-display text-xs font-bold tracking-[0.2em] uppercase md:text-sm"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Performance History
          </p>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="sb-panel flex flex-col items-center px-8 py-14 text-center">
            <svg
              className="mb-4 h-12 w-12 animate-spin text-signal"
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
            <p className="text-lg text-ink/70">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {!loading && message && (
          <div className="sb-panel px-6 py-6 text-center">
            <p className="text-lg font-semibold text-crimson">{message}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && results && Object.keys(results).length === 0 && (
          <div className="sb-panel px-8 py-8 text-center">
            <p className="text-lg text-ink/70">
              No results found for this athlete.
            </p>
          </div>
        )}

        {/* Results by Distance */}
        {!loading && results && Object.keys(results).length > 0 && (
          <div className="w-full space-y-8">
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-xl font-bold tracking-wide text-ink uppercase md:text-2xl">
                {totalRaces} Race{totalRaces === 1 ? "" : "s"} on File
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setSortBy("time")}
                  className="sb-btn px-4 py-2 text-sm"
                  style={
                    {
                      "--btn-accent": primaryColor,
                      ...(sortBy === "time"
                        ? {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            color: getContrastText(primaryColor),
                          }
                        : {}),
                    } as CSSProperties
                  }
                >
                  Sort by Time
                </button>
                <button
                  onClick={() => setSortBy("date")}
                  className="sb-btn px-4 py-2 text-sm"
                  style={
                    {
                      "--btn-accent": primaryColor,
                      ...(sortBy === "date"
                        ? {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            color: getContrastText(primaryColor),
                          }
                        : {}),
                    } as CSSProperties
                  }
                >
                  Sort by Date
                </button>
              </div>
            </div>

            {/* Grouped Results */}
            {sortedEvents.map((event, i) => (
              <Card
                key={event}
                title={event}
                description={`${results[event].length} race${
                  results[event].length > 1 ? "s" : ""
                }`}
                accentHex={i % 2 === 0 ? primaryColor : secondaryColor}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 font-display text-xs font-bold tracking-wide text-ink/60 uppercase">
                          Meet
                        </th>
                        <th className="px-3 py-2 font-display text-xs font-bold tracking-wide text-ink/60 uppercase">
                          Time
                        </th>
                        <th className="px-3 py-2 font-display text-xs font-bold tracking-wide text-ink/60 uppercase">
                          Place
                        </th>
                        <th className="px-3 py-2 font-display text-xs font-bold tracking-wide text-ink/60 uppercase">
                          Team
                        </th>
                        <th className="px-3 py-2 font-display text-xs font-bold tracking-wide text-ink/60 uppercase">
                          Gender
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results[event].map((result, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-border/50 ${
                            idx % 2 === 1 ? "bg-panel-2/40" : ""
                          }`}
                        >
                          <td className="px-3 py-2 text-ink/70">
                            {result.meetName}
                          </td>
                          <td
                            className="px-3 py-2 font-mono font-semibold"
                            style={{ color: primaryColor }}
                          >
                            {result.time}
                          </td>
                          <td className="px-3 py-2 text-ink/70">
                            {result.place}
                          </td>
                          <td className="px-3 py-2 text-ink/70">
                            {result.teamName}
                          </td>
                          <td className="px-3 py-2 text-ink/70">
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
        <footer className="mt-16 text-center">
          <p className="font-mono text-sm text-ink/40">
            © 2026 Anton Michna. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};
