import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScrape = () => {
    setLoading(true);
    setMessage("Scraping...");

    fetch(`${import.meta.env.VITE_API_URL}/api/scrapeTest`)
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
    <div>
      <h1>Scrape Test</h1>
      <button onClick={handleScrape} disabled={loading}>
        {loading ? "Scraping..." : "Scrape Result"}
      </button>
      <p>API says: {message}</p>
    </div>
  );
}

export default App;
