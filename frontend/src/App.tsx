import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./services/api-endpoints";
import { SearchDropdown } from "./components/SearchDropdown";
import { Card } from "./components/Card";
import { BackToSite } from "./components/BackToSite";
import { Background } from "./components/Background";
import type { Athlete, Team } from "./types/api-types";

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
    <div className="min-h-screen w-full">
      <Background />
      <BackToSite />
      <div className="mx-auto w-full max-w-3xl px-4 py-20 md:py-24">
        {/* Header */}
        <header className="mb-14 text-center">
          <p className="font-display text-sm font-bold tracking-[0.4em] text-signal uppercase">
            XC &amp; Track Stats
          </p>
          <p className="mt-5 text-lg text-ink/60 md:text-xl">
            Look up any athlete or team and dig into the results.
          </p>
        </header>

        {/* Main Content */}
        <div className="w-full space-y-8">
          {/* Wake Up the Server Card */}
          <Card
            title="Step 1: Wake Up the Server"
            description="This tool runs on a free server that falls asleep when idle. Tap the button below first and wait for it to respond — search and team lookups below won't work until it's awake."
            accentColor="bg-gold"
          >
            <button
              onClick={handleGetEarliestData}
              disabled={loading}
              className="sb-btn sb-btn-primary w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Spinner />
                  Waking up...
                </>
              ) : (
                "Get Earliest Data"
              )}
            </button>
            {earliestMonth && earliestYear && (
              <div className="mt-6 rounded-lg border border-border bg-panel-2 px-4 py-2 font-mono text-sm text-ink/80">
                Server's awake! Earliest data on file: {earliestMonth}/
                {earliestYear}
              </div>
            )}
          </Card>

          {/* Athlete Search Card */}
          <Card
            title="Step 2: Find an Athlete"
            description="Search by name to pull up every race result on file."
            accentColor="bg-signal"
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
            title="Step 3: Team Averages"
            description="Search a team, then compare their fastest lineup averages across distances."
            accentColor="bg-violet"
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
                className="sb-btn sb-btn-primary mt-4 w-full sm:w-auto"
              >
                {loadingExtras ? (
                  <>
                    <Spinner />
                    Loading...
                  </>
                ) : (
                  `View ${selectedTeam.name}'s Averages`
                )}
              </button>
            )}
          </Card>

          {/* Status Message */}
          {message && (
            <div className="sb-panel px-6 py-4 text-center font-medium">
              <span className="font-display font-bold tracking-wide text-signal uppercase">
                Status:
              </span>{" "}
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="font-mono text-sm text-ink/40">
            © 2026 Anton Michna. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
