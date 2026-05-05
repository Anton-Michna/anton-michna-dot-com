import { useState } from "react";
import { Link } from "react-router-dom";
import type {
  GetFastestTeamAveragesResponse,
  TopKAverageResult,
} from "../types/api";

export const TopFiveAverage: React.FC = () => {
  const [teamId, setTeamId] = useState("1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [averageResults, setAverageResults] = useState<
    TopKAverageResult[] | null
  >(null);

  const handleAvTest = () => {
    if (!teamId) {
      setMessage("Please enter a team ID");
      return;
    }

    setLoading(true);
    setMessage("Fetching average calculation...");

    fetch(`${import.meta.env.VITE_API_URL}/api/getFastestTeamAverages`)
      .then((res) => res.json())
      .then((data: GetFastestTeamAveragesResponse) => {
        if (data.success && data.data) {
          setAverageResults(data.data);
        } else {
          setMessage(data.message || "Average test failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("getFastestTeamAverages error:", error);
        setLoading(false);
      });
  };

  return (
    <div className="top-five-average" style={{ padding: "20px" }}>
      <Link to="/">← Back to Home</Link>
      <h2>Fastest Team Averages</h2>

      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Team ID:{" "}
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="e.g., 1"
              disabled={loading}
            />
          </label>
        </div>
        <button onClick={handleAvTest} disabled={loading}>
          {loading ? "Loading..." : "Get Team Averages"}
        </button>
        {message && <p>{message}</p>}

        {averageResults && averageResults.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Results:</h3>
            {averageResults.map((result, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <h4>{result.meetName}</h4>
                <p>
                  <strong>Average Time:</strong> {result.averageTime}
                </p>
                <div>
                  <strong>Athletes:</strong>
                  <ul>
                    {result.athleteResults.map((athlete, athleteIdx) => (
                      <li key={athleteIdx}>
                        <Link to={`/${athlete.athleteId}`}>
                          {athlete.athleteName}
                        </Link>{" "}
                        - {athlete.time} (Place: {athlete.place})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
