import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import type { TopKAverageResult, Team } from "../types/api-types";
import * as api from "../services/api-endpoints";
import { Card } from "../components/Card";
import { Background } from "../components/Background";
import { getContrastText } from "../utils/color";

function Spinner() {
  return (
    <svg
      className="mr-3 -ml-1 h-5 w-5 animate-spin text-ink"
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
  );
}

export const XcTopAverage: React.FC = () => {
  const location = useLocation();
  const team = location.state?.team as Team | undefined;
  const teamId = team?.id;

  // Get team extras from navigation state
  const logoUrlFromState = (location.state?.logoUrl as string) || "";
  const primaryColorFromState =
    (location.state?.primaryColor as string) || "#22d3ee";
  const secondaryColorFromState =
    (location.state?.secondaryColor as string) || "#8b7cf6";

  const [distance, setDistance] = useState<string>("");
  const [distancePossibilities, setDistancePossibilities] = useState<string[]>(
    [],
  );
  const [athleteCount, setAthleteCount] = useState<5 | 7 | 9>(5);
  const [resultCount, setResultCount] = useState<number>(10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [averageResults, setAverageResults] = useState<
    TopKAverageResult[] | null
  >(null);
  const [logoUrl] = useState<string>(logoUrlFromState);
  const [primaryColor] = useState<string>(primaryColorFromState);
  const [secondaryColor] = useState<string>(secondaryColorFromState);

  // Fetch distance possibilities when team is selected
  useEffect(() => {
    if (!teamId) return;

    api
      .getTeamDistancePossibilities(teamId)
      .then((distances) => {
        setDistancePossibilities(distances);
        // Set first distance as default if available
        if (distances.length > 0) {
          setDistance(distances[0]);
        }
      })
      .catch((error) => {
        console.error("Get distance possibilities error:", error);
      });
  }, [teamId]);

  const hitTopAverageRoute = () => {
    if (!teamId) {
      setMessage("Please select a team");
      return;
    }

    if (!distance) {
      setMessage("Please select a distance");
      return;
    }

    setLoading(true);
    setMessage("Fetching average calculation...");

    api
      .getFastestTeamAverages({ teamId, distance, athleteCount, resultCount })
      .then((data) => {
        if (data.success && data.data) {
          setAverageResults(data.data);
          setMessage("");
        } else {
          setMessage(data.message || "Average test failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("getFastestTeamAverages error:", error);
        setMessage("API not reachable");
        setLoading(false);
      });
  };

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

      {!team && (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="sb-panel max-w-md px-8 py-8 text-center">
            <p className="text-lg font-semibold text-crimson">
              No team selected. Please go back and select a team.
            </p>
          </div>
        </div>
      )}

      {team && (
        <div className="mx-auto w-full max-w-3xl px-4 py-20 md:py-24">
          {/* Team Header */}
          <header className="mb-10 text-center">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-border bg-white p-3 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.7)] md:h-28 md:w-28"
              style={{
                backgroundImage: !logoUrl
                  ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                  : undefined,
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={team.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-3xl font-extrabold text-white">
                  {team.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="mt-5 font-display text-4xl leading-none font-black tracking-tight text-ink uppercase md:text-6xl">
              {team.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <span
                className="rounded border px-4 py-1 font-display text-xs font-bold tracking-wide uppercase md:text-sm"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {team.gender === "Men" ? "Men's" : "Women's"}
              </span>
              <span
                className="rounded border px-4 py-1 font-display text-xs font-bold tracking-wide uppercase md:text-sm"
                style={{ borderColor: secondaryColor, color: secondaryColor }}
              >
                {team.sport.toLowerCase() === "xc"
                  ? "Cross Country"
                  : "Track & Field"}
              </span>
            </div>
          </header>

          <div className="w-full space-y-8">
            {/* Configuration Card */}
            <Card
              title="Configure Search"
              description="Set your parameters to find the fastest team averages."
              accentHex={primaryColor}
            >
              <div className="space-y-4">
                {distancePossibilities.length > 0 && (
                  <div>
                    <label className="mb-1 block font-display text-sm font-bold tracking-wide text-ink uppercase">
                      Distance
                    </label>
                    <select
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      disabled={loading}
                      className="sb-field"
                    >
                      {distancePossibilities.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-1 block font-display text-sm font-bold tracking-wide text-ink uppercase">
                    Top Team Members
                  </label>
                  <select
                    value={athleteCount}
                    onChange={(e) =>
                      setAthleteCount(Number(e.target.value) as 5 | 7 | 9)
                    }
                    disabled={loading}
                    className="sb-field"
                  >
                    <option value={5}>5</option>
                    <option value={7}>7</option>
                    <option value={9}>9</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-display text-sm font-bold tracking-wide text-ink uppercase">
                    Number of Results
                  </label>
                  <input
                    type="number"
                    value={resultCount}
                    onChange={(e) => setResultCount(Number(e.target.value))}
                    disabled={loading}
                    min="1"
                    max="100"
                    className="sb-field"
                  />
                </div>

                <button
                  onClick={hitTopAverageRoute}
                  disabled={loading}
                  className="sb-btn w-full sm:w-auto"
                  style={
                    {
                      "--btn-accent": primaryColor,
                      ...(loading
                        ? {}
                        : {
                            backgroundColor: primaryColor,
                            borderColor: primaryColor,
                            color: getContrastText(primaryColor),
                          }),
                    } as CSSProperties
                  }
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Loading...
                    </>
                  ) : (
                    "Get Team Averages"
                  )}
                </button>
              </div>
            </Card>

            {/* Status Message */}
            {message && (
              <div className="sb-panel px-6 py-4 text-center font-medium">
                <span
                  className="font-display font-bold tracking-wide uppercase"
                  style={{ color: primaryColor }}
                >
                  Status:
                </span>{" "}
                {message}
              </div>
            )}

            {/* Results */}
            {averageResults && averageResults.length > 0 && (
              <Card
                title="Results"
                description={`Top ${averageResults.length} fastest team average${averageResults.length > 1 ? "s" : ""}.`}
                accentHex={secondaryColor}
              >
                <div className="space-y-4">
                  {averageResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-panel-2 p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl font-bold tracking-wide text-ink uppercase">
                          {result.meetName}
                        </h3>
                        <div
                          className="rounded border px-4 py-1 font-mono text-sm font-semibold"
                          style={{
                            borderColor: `${secondaryColor}66`,
                            backgroundColor: `${secondaryColor}1a`,
                            color: secondaryColor,
                          }}
                        >
                          {result.averageTime}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 font-display text-xs font-bold tracking-wide text-ink/50 uppercase">
                          Athletes
                        </h4>
                        <div className="grid gap-2">
                          {result.athleteResults.map(
                            (athlete, athleteIdx) => (
                              <Link
                                key={athleteIdx}
                                to={`/${athlete.athleteId}`}
                                className="group flex items-center justify-between rounded-lg border border-border bg-panel p-3 transition-colors hover:border-[var(--team-accent)] hover:bg-[var(--team-accent)]/10"
                                style={
                                  {
                                    "--team-accent": primaryColor,
                                  } as CSSProperties
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-sm text-ink/50">
                                    #{athleteIdx + 1}
                                  </span>
                                  <span className="font-semibold text-ink">
                                    {athlete.athleteName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span
                                    className="font-mono font-semibold"
                                    style={{ color: primaryColor }}
                                  >
                                    {athlete.time}
                                  </span>
                                  <span className="text-sm text-ink/50">
                                    Place: {athlete.place}
                                  </span>
                                </div>
                              </Link>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-16 text-center">
            <p className="font-mono text-sm text-ink/40">
              © 2026 Anton Michna. All rights reserved.
            </p>
          </footer>
        </div>
      )}
    </div>
  );
};
