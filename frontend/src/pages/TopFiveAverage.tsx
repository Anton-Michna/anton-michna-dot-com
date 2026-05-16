import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { TopKAverageResult, Team } from "../types/api-types";
import * as api from "../services/api-endpoints";

export const XcTopAverage: React.FC = () => {
  const location = useLocation();
  const team = location.state?.team as Team | undefined;
  const teamId = team?.id;

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

  // Fetch distance possibilities when team is selected
  useEffect(() => {
    if (teamId) {
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
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDistancePossibilities([]);
      setDistance("");
    }
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
    <div className="top-five-average" style={{ padding: "20px" }}>
      <Link to="/">← Back to Home</Link>
      <h2>Fastest Team Averages</h2>

      {!team && (
        <p style={{ color: "red" }}>
          No team selected. Please go back and select a team.
        </p>
      )}

      {team && (
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <strong>Selected Team:</strong> {team.name} (
          {team.gender === "Men" ? "M" : "F"}) (
          {team.sport.toLowerCase() === "xc" ? "XC" : "TF"})
        </div>
      )}

      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        {teamId && distancePossibilities.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            <label>
              Distance:{" "}
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                disabled={loading}
                style={{ width: "150px", padding: "4px" }}
              >
                {distancePossibilities.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div style={{ marginBottom: "10px" }}>
          <label>
            Top Team Members:{" "}
            <select
              value={athleteCount}
              onChange={(e) =>
                setAthleteCount(Number(e.target.value) as 5 | 7 | 9)
              }
              disabled={loading}
              style={{ width: "100px", padding: "4px" }}
            >
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={9}>9</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Number of Results:{" "}
            <input
              type="number"
              value={resultCount}
              onChange={(e) => setResultCount(Number(e.target.value))}
              disabled={loading}
              min="1"
              max="100"
              style={{ width: "100px", padding: "4px" }}
            />
          </label>
        </div>
        <button onClick={hitTopAverageRoute} disabled={loading}>
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
