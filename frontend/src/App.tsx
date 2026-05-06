import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./services/api-endpoints";
import { SearchDropdown } from "./components/SearchDropdown";
import type { Athlete } from "./types/api-types";

function App() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [earliestMonth, setEarliestMonth] = useState<string | null>(null);
  const [earliestYear, setEarliestYear] = useState<string | null>(null);
  // const [month, setMonth] = useState("");
  // const [year, setYear] = useState("");

  const fetchAthletes = useCallback(
    async (query: string): Promise<Athlete[]> => {
      return api.searchAthletes(query);
    },
    [],
  );

  const handleAthleteSelect = (athlete: Athlete) => {
    navigate(`/${athlete.id}`);
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
        <h2>View Fastest Averages</h2>
        <button onClick={() => navigate("/fastestAvg")}>
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
