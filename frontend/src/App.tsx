import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./services/api-endpoints";
import { SearchDropdown } from "./components/SearchDropdown";
import type { Athlete, Team } from "./types/api-types";

function App() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [earliestMonth, setEarliestMonth] = useState<string | null>(null);
  const [earliestYear, setEarliestYear] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const [selectedTeamForExtras, setSelectedTeamForExtras] = useState<
    Team | undefined
  >(undefined);
  const [teamLogoUrl, setTeamLogoUrl] = useState<string | null>(null);
  // const [month, setMonth] = useState("");
  // const [year, setYear] = useState("");

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

  const handleTeamSelectForExtras = (team: Team) => {
    setSelectedTeamForExtras(team);
  };

  const handleGoToFastestAvg = () => {
    if (selectedTeam) {
      navigate("/fastestAvg", { state: { team: selectedTeam } });
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

  const handleGetTeamExtras = () => {
    if (!selectedTeamForExtras) {
      setMessage("Please select a team for team extras");
      return;
    }

    setLoading(true);
    setMessage("Running getTeamExtras...");
    setTeamLogoUrl(null);

    api
      .getTeamExtras(selectedTeamForExtras.id)
      .then((data) => {
        if (data.success && data.data) {
          const logoUrl = data.data.logoUrl;
          if (logoUrl) {
            setTeamLogoUrl(logoUrl);
            setMessage("Team logo retrieved successfully");
          } else {
            setMessage("Team extras completed but no logo found");
          }
        } else {
          setMessage(data.message || "Failed to get team extras");
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage("API not reachable");
        setLoading(false);
      });
  };

  // const handleScrape = () => {
  //   setLoading(true);
  //   setMessage("Scraping...");

  //   const params = new URLSearchParams();
  //   if (month) params.append("month", month);
  //   if (year) params.append("year", year);

  //   const url = `${import.meta.env.VITE_API_URL}/api/scrapeXcResults${
  //     params.toString() ? `?${params.toString()}` : ""
  //   }`;

  //   fetch(url)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setMessage(data.message || "Scrape completed!");
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setMessage("API not reachable");
  //       setLoading(false);
  //     });
  // };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Anton Michna Dot Com</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Get Earliest Data</h2>
        <button onClick={handleGetEarliestData} disabled={loading}>
          Get Earliest Data
        </button>
        {earliestMonth && earliestYear && (
          <p>
            Earliest data from: {earliestMonth}/{earliestYear}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Get Team Extras</h2>
        <div style={{ marginBottom: "10px" }}>
          <SearchDropdown<Team>
            onSelect={handleTeamSelectForExtras}
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
            label="Team Name:"
            placeholder="Search for a team..."
          />
        </div>
        <button
          onClick={handleGetTeamExtras}
          disabled={loading || !selectedTeamForExtras}
        >
          Get Team Extras
        </button>
        {teamLogoUrl && (
          <div style={{ marginTop: "15px" }}>
            <img
              src={teamLogoUrl}
              alt="Team Logo"
              style={{ maxHeight: "100px", maxWidth: "200px" }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>View Fastest Averages</h2>
        <div style={{ marginBottom: "10px" }}>
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
            label="Team Name:"
            placeholder="Search for a team..."
          />
        </div>
        <button onClick={handleGoToFastestAvg} disabled={!selectedTeam}>
          Go to Fastest Averages
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Search Athlete</h2>
        <SearchDropdown<Athlete>
          onSelect={handleAthleteSelect}
          fetchResults={fetchAthletes}
          renderItem={(athlete) => <>{athlete.name}</>}
          getItemKey={(athlete) => athlete.id}
          getDisplayValue={(athlete) => athlete.name}
          disabled={loading}
          placeholder="Search for an athlete..."
        />
      </div>

      <p>Status: {message}</p>
    </div>
  );
}

export default App;

// <div style={{ marginBottom: "20px" }}>
//   <h2>Scrape XC Results</h2>
//   <div style={{ marginBottom: "10px" }}>
//     <label>
//       Month (1-12):{" "}
//       <input
//         type="number"
//         value={month}
//         onChange={(e) => setMonth(e.target.value)}
//         disabled={loading}
//         min="1"
//         max="12"
//         placeholder="Optional"
//         style={{ width: "100px", padding: "4px", marginRight: "10px" }}
//       />
//     </label>
//     <label>
//       Year:{" "}
//       <input
//         type="number"
//         value={year}
//         onChange={(e) => setYear(e.target.value)}
//         disabled={loading}
//         min="1900"
//         max="2100"
//         placeholder="Optional"
//         style={{ width: "100px", padding: "4px" }}
//       />
//     </label>
//   </div>
//   <button onClick={handleScrape} disabled={loading}>
//     Start Scrape
//   </button>
// </div>
