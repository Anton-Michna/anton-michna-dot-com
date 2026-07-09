import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./services/api-endpoints";
import { SearchDropdown } from "./components/SearchDropdown";
import { Card } from "./components/Card";
import type { Athlete, Team } from "./types/api-types";

function App() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [earliestMonth, setEarliestMonth] = useState<string | null>(null);
  const [earliestYear, setEarliestYear] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const [loadingExtras, setLoadingExtras] = useState(false);

  const fetchAthletes = useCallback(
    async (query: string): Promise<Athlete[]> => {
      return api.searchAthletes(query);
    },
    [],
  );

  const fetchTeams = useCallback(async (query: string): Promise<Team[]> => {
    return api.searchTeams(query);
  }, []);

  const handleAthleteSelect = (athlete: Athlete) => {
    navigate(`/${athlete.id}`);
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleGoToFastestAvg = async () => {
    if (!selectedTeam) return;

    setLoadingExtras(true);
    setMessage("Loading team information...");

    try {
      const extrasData = await api.getTeamExtras(selectedTeam.id);

      if (extrasData.success && extrasData.data) {
        navigate("/fastestAvg", {
          state: {
            team: selectedTeam,
            logoUrl: extrasData.data.logoUrl || "",
            primaryColor: extrasData.data.primaryColor || "#3b82f6",
            secondaryColor: extrasData.data.secondaryColor || "#8b5cf6",
          },
        });
      } else {
        // Navigate with defaults if extras fetch fails
        navigate("/fastestAvg", {
          state: {
            team: selectedTeam,
            logoUrl: "",
            primaryColor: "#3b82f6",
            secondaryColor: "#8b5cf6",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching team extras:", error);
      setMessage("Failed to load team information");
      // Navigate with defaults if error occurs
      navigate("/fastestAvg", {
        state: {
          team: selectedTeam,
          logoUrl: "",
          primaryColor: "#3b82f6",
          secondaryColor: "#8b5cf6",
        },
      });
    } finally {
      setLoadingExtras(false);
      setMessage("");
    }
  };

  const handleGetEarliestData = () => {
    setLoading(true);
    setMessage("Fetching earliest data...");

    api
      .getEarliestMeet()
      .then((data) => {
        if (data.success) {
          setEarliestMonth(data.earliestMonth || null);
          setEarliestYear(data.earliestYear || null);
          setMessage(
            data.earliestMonth && data.earliestYear
              ? `Earliest data: ${data.earliestMonth}/${data.earliestYear}`
              : "No data available",
          );
        } else {
          setMessage(data.message || "Failed to fetch earliest data");
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage("API not reachable");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Anton Michna
          </h1>
          <p className="text-xl text-blue-200">
            Cross Country & Track Analytics
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Athlete Search Card */}
          <Card
            title="Search Athlete"
            description="Find detailed performance stats for any cross country or track athlete"
            accentColor="bg-blue-400"
          >
            <SearchDropdown<Athlete>
              onSelect={handleAthleteSelect}
              fetchResults={fetchAthletes}
              renderItem={(athlete) => (
                <>
                  {athlete.name} ({athlete.gender === "Men" ? "M" : "F"}) (
                  {athlete.teamName})
                </>
              )}
              getItemKey={(athlete) => athlete.id}
              getDisplayValue={(athlete) => athlete.name}
              disabled={loading}
              placeholder="Search for an athlete..."
            />
          </Card>

          {/* Team Search Card for Fastest Averages */}
          <Card
            title="View Fastest Averages"
            description="Search for a team to view their best team averages across distances"
            accentColor="bg-purple-400"
          >
            <SearchDropdown<Team>
              onSelect={handleTeamSelect}
              fetchResults={fetchTeams}
              renderItem={(team) => (
                <>
                  {team.name} ({team.gender === "Men" ? "M" : "F"}) (
                  {team.sport.toLowerCase() === "xc" ? "XC" : "TF"})
                </>
              )}
              getItemKey={(team) => team.id}
              getDisplayValue={(team) => team.name}
              disabled={loading}
              placeholder="Search for a team..."
            />
            {selectedTeam && (
              <button
                onClick={handleGoToFastestAvg}
                disabled={loading || loadingExtras}
                className="mt-4 w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loadingExtras ? (
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
                  "Go to Fastest Averages"
                )}
              </button>
            )}
          </Card>

          {/* Data Info Card */}
          <Card
            title="Database Info"
            description="Check the earliest meet data available in our database"
            accentColor="bg-emerald-400"
          >
            <button
              onClick={handleGetEarliestData}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
                "Get Earliest Data"
              )}
            </button>
            {earliestMonth && earliestYear && (
              <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-lg">
                <p className="text-emerald-100 font-medium">
                  📅 Earliest data from: {earliestMonth}/{earliestYear}
                </p>
              </div>
            )}
          </Card>

          {/* Status Message */}
          {message && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <p className="text-blue-100 text-center">
                <span className="font-semibold">Status:</span> {message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16">
          <p className="text-blue-300/60 text-sm">
            © 2026 Anton Michna. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
