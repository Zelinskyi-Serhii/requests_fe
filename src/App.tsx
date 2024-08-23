import { useState } from "react";
import axios from "axios";
import "./App.css";

export const App = () => {
  const [concurrencyLimit, setConcurrencyLimit] = useState(10);
  const [requestsPerSecond, setRequestsPerSecond] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<
    {
      isError: boolean;
      response: string;
    }[]
  >([]);

  const handleStart = async () => {
    setIsRunning(true);
    setResults([]);

    let activeRequests = 0;
    let sendedRequests = 0;
    const totalRequests = 1000;

    const sendRequest = async (index: number) => {
      try {
        await axios.get(`${import.meta.env.VITE_BASE_URL}/api?index=${index}`);
        setResults((prev) => [
          ...prev,
          { isError: false, response: `Success: ${index}` },
        ]);
      } catch {
        setResults((prev) => [
          ...prev,
          { isError: true, response: `Error: ${index}` },
        ]);
      } finally {
        activeRequests--;
      }
    };

    const startSendingRequests = () => {
      const intervalId = setInterval(() => {
        console.log(sendedRequests);

        while (
          activeRequests < concurrencyLimit &&
          sendedRequests < totalRequests
        ) {
          activeRequests++;
          sendedRequests++;
          sendRequest(sendedRequests);
        }
        if (sendedRequests >= totalRequests) {
          clearInterval(intervalId);
          setIsRunning(false);
        }
      }, 1000 / requestsPerSecond);
    };

    startSendingRequests();
  };

  return (
    <div>
      <div>
        <label>
          Concurrency Limit:
          <input
            type="number"
            value={concurrencyLimit}
            onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
            min="1"
            max="100"
            required
          />
        </label>
      </div>

      <div>
        <label>
          Requests Per Second:
          <input
            type="number"
            value={requestsPerSecond}
            onChange={(e) => setRequestsPerSecond(Number(e.target.value))}
            min="1"
            max="100"
            required
          />
        </label>
      </div>

      <button onClick={handleStart} disabled={isRunning}>
        {isRunning ? "Running..." : "Start"}
      </button>

      <div>
        <h2>Results</h2>
        <ul>
          {results.map((result, index) => (
            <li key={index} className={`${result.isError && "error"}`}>
              Request {result.response} completed
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
