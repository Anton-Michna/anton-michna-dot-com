import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("API URL:", import.meta.env.VITE_API_URL);
    fetch(`${import.meta.env.VITE_API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("API not reachable"));
  }, []);

  return (
    <div>
      <h1>My Full Stack App</h1>
      <p>API says: {message}</p>
    </div>
  );
}

export default App;