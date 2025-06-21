// React state and lifecycle functions
import { useState, useEffect } from "react";
//Firestore and Firebase Auth
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase"; // your configured Firebase instance
import Sidebar from "./dashboard/components/sidebar"; // adding the sidebar component

const TradeForm = () => {
  const [ticker, setTicker] = useState(""); // stock symbol (e.g., AAPL)
  const [quantity, setQuantity] = useState(""); // number of shares
  const [price, setPrice] = useState(""); // price per share
  const [date, setDate] = useState(""); // trade date
  const [user, setUser] = useState(null); // current Firebase user
  const [userPositions, setUserPositions] = useState({}); // to store user's current positions

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        fetchUserPositions(u);
      }
    });
    return () => unsubscribe(); //
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserPositions(user);
    }
  }, [user]);

  const fetchUserPositions = async (u) => {
    if (!u) return;

    const q = query(collection(db, "trades"), where("userId", "==", u.uid));
    const snapshot = await getDocs(q);

    const positions = {};
    snapshot.forEach(doc => {
      const { ticker, action, quantity } = doc.data();
      if (!positions[ticker]) positions[ticker] = 0;

      if (action === "BUY") {
        positions[ticker] += quantity; // add quantity for BUY action
      } else if (action === "SELL") {
        positions[ticker] -= quantity; // subtract quantity for SELL action
      }
    });

    Object.keys(positions).forEach(ticker => {
      if (positions[ticker] <= 0) delete positions[ticker];
    });

    setUserPositions(positions); //update state with user positions
  };

  const handleSubmit = async (e, actionType) => {
    e.preventDefault(); // prevent the page from reloading on submit

    if (!user) return alert("You must be logged in to add a trade.");

    if (!ticker.trim()) {
      return alert("Please enter a ticker symbol.");
    }

    if (!quantity || Number(quantity) <= 0) {
      return alert("Please enter a valid quantity (greater than 0).");
    }

    if (!price || Number(price) <= 0) {
      return alert("Please enter a valid price (greater than 0).");
    }

    if (!date) {
      return alert("Please select a date for the trade.");
    }

    if (!tickerSuggestions.includes(ticker.toUpperCase())) {
      return alert(`"${ticker.toUpperCase()}" is not a valid ticker. Please select from the dropdown suggestions.`);
    }

    if (actionType === "SELL") {
      const currentPosition = userPositions[ticker.toUpperCase()] || 0; // get current position for the ticker, default to 0 if not found
      if (currentPosition === 0) {
        return alert(`You don't own any shares of ${ticker.toUpperCase()}.`); //alert if no shares owned
      }
      if (Number(quantity) > currentPosition) {
        return alert(`You only own ${currentPosition} shares of ${ticker.toUpperCase()}. Cannot sell ${quantity} shares.`); //alert if not enough shares to sell
      }
    }

    await addDoc(collection(db, "trades"), {
      ticker: ticker.toUpperCase(),       // ensure uppercase (e.g., AAPL)
      action: actionType,                             // "BUY" or "SELL"
      quantity: Number(quantity),         // convert string to number
      price: Number(price),               // convert string to number
      date: Timestamp.fromDate(new Date(date)), // convert input date to Firestore Timestamp
      userId: user.uid                    // associate the trade with the logged-in user
    });

    alert(`${actionType} trade added!`);
    setTicker(""); setQuantity(""); setPrice(""); setDate("");
    fetchUserPositions(user);
  };

  const tickerSuggestions = ["AAPL", "ABBV", "ABNB", "ABT", "ACN", "ADBE", "AEP", "AIG", "AMD", "AMAT",
    "AMGN", "AMT", "AMZN", "APP", "ARM", "ASML", "AVGO", "AXP", "BA", "BAC",
    "BIIB", "BK", "BKNG", "BLK", "BMY", "BRK.B", "C", "CAT", "CHTR", "CL",
    "CMCSA", "COF", "COP", "COST", "CRM", "CSCO", "CVS", "CVX", "CDNS", "CDW",
    "DE", "DHR", "DIS", "DUK", "EMR", "FDX", "GD", "GE", "GILD", "GM",
    "GOOG", "GOOGL", "GS", "HD", "HON", "IBM", "INTC", "INTU", "ISRG", "JNJ",
    "JPM", "KO", "LIN", "LLY", "LMT", "LOW", "MA", "MAR", "MCD", "MDT",
    "MET", "MDLZ", "MELI", "META", "MMM", "MO", "MRK", "MRVL", "MSTR", "MS",
    "MSFT", "MU", "NFLX", "NEE", "NKE", "NOW", "NVDA", "NXPI", "ORLY", "ODFL",
    "ON", "PCAR", "PEP", "PFE", "PG", "PLTR", "PM", "PYPL", "QCOM", "REGN",
    "ROP", "ROST", "SHOP", "SCHW", "SNPS", "SBUX", "T", "TMUS", "TSLA", "TTWO",
    "TXN", "UNH", "UNP", "UPS", "USB", "V", "VZ", "WBD", "WDAY", "WFC", "WMT",
    "XEL", "XOM", "ZS", "COIN", "DKNG", "F", "LCID", "RIVN", "ROKU", "SNAP", "SPOT", "SQ",
    "TWTR", "UBER", "UPST", "ZM", "ARKK", "QQQ", "SPY", "IWM", "DIA", "SQQQ"
  ]; // example of ticker autofills can use API to make it more comprehensive (but we dont have enough api calls to do that)
  
  const todayStr = new Date().toISOString().split("T")[0]; //get today's date

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0E0F23", color: "white" }}>
      <Sidebar />

      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem"
      }}>
        <div style={{
          backgroundColor: "#1E1F3B",
          padding: "2.5rem",
          borderRadius: "1rem",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
        }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "1.8rem",
            marginBottom: "1.5rem"
          }}>
            Add Trade
          </h2>

          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              list="tickers"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Ticker"
              required
              style={{
                padding: "0.75rem",
                border: "none",
                borderRadius: "0.5rem",
                backgroundColor: "#2A2C4D",
                color: "white",
                fontSize: "1rem"
              }}
            />
            <datalist id="tickers">
              {tickerSuggestions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>

            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              required
              style={{
                padding: "0.75rem",
                border: "none",
                borderRadius: "0.5rem",
                backgroundColor: "#2A2C4D",
                color: "white",
                fontSize: "1rem"
              }}
            />

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              required
              style={{
                padding: "0.75rem",
                border: "none",
                borderRadius: "0.5rem",
                backgroundColor: "#2A2C4D",
                color: "white",
                fontSize: "1rem"
              }}
            />

            <input
              type="date"
              value={date}
              max={todayStr} // restrict to today or earlier
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                padding: "0.75rem",
                border: "none",
                borderRadius: "0.5rem",
                backgroundColor: "#2A2C4D",
                color: "white",
                fontSize: "1rem"
              }}
            />

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "BUY")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  backgroundColor: "#00ff99",
                  color: "#22223b",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#00cc7a"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#00ff99"}
              >
                BUY
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, "SELL")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#d73027"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ff4d4f"}
              >
                SELL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;
