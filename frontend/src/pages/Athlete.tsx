import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import type { GetAthleteResults } from "../types/api-types";
import * as api from "../services/api-endpoints";

export const Athlete: React.FC = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const [results, setResults] = useState<GetAthleteResults[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAthleteResults = useCallback((id: string) => {
    setLoading(true);
    setMessage("Loading athlete results...");

    api
      .getAthleteResults(id)
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
      fetchAthleteResults(athleteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId]);

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/">← Back to Home</Link>
      <h2>Athlete Results</h2>
      <p>Athlete ID: {athleteId}</p>

      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}

      {results && results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results ({results.length} total):</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #333" }}>
                <th style={{ padding: "8px", textAlign: "left" }}>Meet</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Event</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Time</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Place</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Team</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Gender</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "8px" }}>{result.meetName}</td>
                  <td style={{ padding: "8px" }}>{result.event}</td>
                  <td style={{ padding: "8px" }}>{result.time}</td>
                  <td style={{ padding: "8px" }}>{result.place}</td>
                  <td style={{ padding: "8px" }}>{result.teamName}</td>
                  <td style={{ padding: "8px" }}>{result.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results && results.length === 0 && (
        <p>No results found for this athlete.</p>
      )}
    </div>
  );
};
