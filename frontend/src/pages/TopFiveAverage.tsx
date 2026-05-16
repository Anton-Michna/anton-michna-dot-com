import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { TopKAverageResult, Team } from "../types/api-types";
import * as api from "../services/api-endpoints";
import { Card } from "../components/Card";

export const XcTopAverage: React.FC = () => {
  const location = useLocation();
  const team = location.state?.team as Team | undefined;
  const teamId = team?.id;

  // Get team extras from navigation state
  const logoUrlFromState = (location.state?.logoUrl as string) || "";
  const primaryColorFromState =
    (location.state?.primaryColor as string) || "#3b82f6";
  const secondaryColorFromState =
    (location.state?.secondaryColor as string) || "#8b5cf6";

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
  const [logoHeight, setLogoHeight] = useState<string>("85vh"); // dynamic logo height

  // Handle logo load to determine quality and adjust size
  const handleLogoLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const height = img.naturalHeight;
    const width = img.naturalWidth;

    if (height >= 800 || width >= 800) {
      setLogoHeight("85vh"); // Large for high quality
    } else if (height >= 500 || width >= 500) {
      setLogoHeight("60vh"); // Medium for medium quality
    } else {
      setLogoHeight("40vh"); // Smaller for low quality to avoid pixelation
    }
  };

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

      {!team && (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-6 text-center max-w-md">
            <p className="text-red-200 text-lg">
              No team selected. Please go back and select a team.
            </p>
          </div>
        </div>
      )}

      {team && (
        <div className="flex min-h-screen">
          {/* Left Side - Large Logo with Gradient - FIXED */}
          <div className="w-1/3 fixed left-0 top-0 h-screen flex items-center justify-center">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, transparent 0%, ${primaryColor}10 30%, ${secondaryColor}10 70%, transparent 100%)`,
              }}
            />
            {logoUrl ? (
              <div className="relative z-10 w-full h-full flex items-center justify-center px-8 py-8">
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    height: logoHeight,
                    width: "85%",
                    maxWidth: "600px",
                    maskImage:
                      "linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                  }}
                >
                  <img
                    src={logoUrl}
                    alt={team.name}
                    className="object-contain"
                    onLoad={handleLogoLoad}
                    style={{
                      maxHeight: logoHeight,
                      maxWidth: "100%",
                      height: logoHeight,
                      width: "auto",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="relative z-10 text-center px-12">
                <h1
                  className="text-8xl font-bold mb-4"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    maskImage:
                      "linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                  }}
                >
                  {team.name}
                </h1>
                <div className="text-3xl text-white/60 space-y-2">
                  <p>{team.gender === "Men" ? "Men's" : "Women's"}</p>
                  <p>
                    {team.sport.toLowerCase() === "xc"
                      ? "Cross Country"
                      : "Track & Field"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Search Fields and Results */}
          <div className="w-2/3 ml-[33.333%] overflow-y-auto py-12 px-8 min-h-screen">
            <div className="max-w-2xl">
              {/* Title Section */}
              <div className="mb-8">
                <h1 className="text-5xl font-bold text-white mb-2">
                  Fastest Team Averages
                </h1>
                <div className="flex items-center gap-2 text-lg text-blue-200">
                  <span className="font-semibold">{team.name}</span>
                  <span className="text-blue-300">•</span>
                  <span>{team.gender === "Men" ? "Men" : "Women"}</span>
                  <span className="text-blue-300">•</span>
                  <span>{team.sport.toLowerCase() === "xc" ? "XC" : "TF"}</span>
                </div>
              </div>

              {/* Configuration Card */}
              <Card
                title="Configure Search"
                description="Set your parameters to find the fastest team averages"
                accentColor="bg-purple-400"
              >
                <div className="space-y-4">
                  {distancePossibilities.length > 0 && (
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Distance
                      </label>
                      <select
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        style={{ color: "white" }}
                      >
                        {distancePossibilities.map((dist) => (
                          <option
                            key={dist}
                            value={dist}
                            style={{ color: "black" }}
                          >
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Top Team Members
                    </label>
                    <select
                      value={athleteCount}
                      onChange={(e) =>
                        setAthleteCount(Number(e.target.value) as 5 | 7 | 9)
                      }
                      disabled={loading}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      style={{ color: "white" }}
                    >
                      <option value={5} style={{ color: "black" }}>
                        5
                      </option>
                      <option value={7} style={{ color: "black" }}>
                        7
                      </option>
                      <option value={9} style={{ color: "black" }}>
                        9
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Number of Results
                    </label>
                    <input
                      type="number"
                      value={resultCount}
                      onChange={(e) => setResultCount(Number(e.target.value))}
                      disabled={loading}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={hitTopAverageRoute}
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    style={{
                      background: loading
                        ? undefined
                        : `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Loading...
                      </span>
                    ) : (
                      "Get Team Averages"
                    )}
                  </button>
                </div>
              </Card>

              {/* Status Message */}
              {message && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
                  <p className="text-blue-100 text-center">
                    <span className="font-semibold">Status:</span> {message}
                  </p>
                </div>
              )}

              {/* Results */}
              {averageResults && averageResults.length > 0 && (
                <Card
                  title="Results"
                  description={`Top ${averageResults.length} fastest team average${averageResults.length > 1 ? "s" : ""}`}
                  accentColor="bg-emerald-400"
                >
                  <div className="space-y-4">
                    {averageResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-white">
                            {result.meetName}
                          </h3>
                          <div
                            className="px-4 py-2 rounded-lg font-bold text-lg"
                            style={{
                              background: `linear-gradient(to right, ${primaryColor}30, ${secondaryColor}30)`,
                              border: `1px solid ${primaryColor}50`,
                              color: "#fff",
                            }}
                          >
                            {result.averageTime}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-semibold mb-3 text-lg">
                            Athletes:
                          </h4>
                          <div className="grid gap-2">
                            {result.athleteResults.map(
                              (athlete, athleteIdx) => (
                                <Link
                                  key={athleteIdx}
                                  to={`/${athlete.athleteId}`}
                                  className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-blue-200 font-semibold text-lg">
                                      #{athleteIdx + 1}
                                    </span>
                                    <span className="text-white group-hover:text-blue-200 transition-colors font-medium">
                                      {athlete.athleteName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-blue-100 font-semibold">
                                      {athlete.time}
                                    </span>
                                    <span className="text-blue-300 text-sm">
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
          </div>
        </div>
      )}
    </div>
  );
};
