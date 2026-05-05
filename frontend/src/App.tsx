import { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [earliestMonth, setEarliestMonth] = useState<string | null>(null);
  const [earliestYear, setEarliestYear] = useState<string | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleGetEarliestData = () => {
    setLoading(true);
    setMessage("Fetching earliest data...");

    fetch(`${import.meta.env.VITE_API_URL}/api/earliestMeet`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEarliestMonth(data.earliestMonth);
          setEarliestYear(data.earliestYear);
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

  const handleScrape = () => {
    setLoading(true);
    setMessage("Scraping...");

    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);

    const url = `${import.meta.env.VITE_API_URL}/api/scrapeXcResults${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || "Scrape completed!");
        setLoading(false);
      })
      .catch(() => {
        setMessage("API not reachable");
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Scrape Test</h1>

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
        <h2>Scrape XC Results</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Month (1-12):{" "}
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="e.g., 9"
              disabled={loading}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Year:{" "}
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2024"
              disabled={loading}
            />
          </label>
        </div>
        <button onClick={handleScrape} disabled={loading}>
          {loading ? "Scraping..." : "Scrape Result"}
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>View Fastest Averages</h2>
        <button onClick={() => navigate("/fastestAvg")}>
          Go to Fastest Averages
        </button>
      </div>

      <p>Status: {message}</p>
    </div>
  );
}

export default App;
