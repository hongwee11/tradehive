// React state and lifecycle functions
import { useState, useEffect } from "react";
// Firestore and Firebase Auth
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase"; // your configured Firebase instance
import Sidebar from "./dashboard/components/sidebar"; // adding the sidebar component

// The TradeForm component lets a user input a trade and store it in Firestore
const TradeForm = () => {
  // Local state for form inputs
  const [ticker, setTicker] = useState(""); // stock symbol (e.g., AAPL)
  const [action, setAction] = useState("BUY"); // BUY or SELL
  const [quantity, setQuantity] = useState(""); // number of shares
  const [price, setPrice] = useState(""); // price per share
  const [date, setDate] = useState(""); // trade date
  const [user, setUser] = useState(null); // current Firebase user
  const [userPositions, setUserPositions] = useState({}); // to store user's current positions

  // This runs once when the component loads, to detect if a user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
    if (u) {
      setUser(u);
      fetchUserPositions();
    }
  });
  return () => unsubscribe(); //
}, []);

//Fetch user positions
 useEffect(() => {
  if (user) {
    fetchUserPositions();
  }
}, [user]);

//Fetch user positions from Firestore
const fetchUserPositions = async () => {
  if (!user) return;
  
  const q = query(collection(db, "trades"), where("userId", "==", user.uid));
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
  
  // Only keep positive positions
  Object.keys(positions).forEach(ticker => {
    if (positions[ticker] <= 0) delete positions[ticker];
  });
  
  setUserPositions(positions); //update state with user positions
};
  // This function handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent the page from reloading on submit

    // If not logged in, don't allow submission
    if (!user) return alert("You must be logged in to add a trade.");

    //Validation to see if user owns the stock before selling
    if (action === "SELL") {
    const currentPosition = userPositions[ticker.toUpperCase()] || 0; // get current position for the ticker, default to 0 if not found
    if (currentPosition === 0) {
      return alert(`You don't own any shares of ${ticker.toUpperCase()}.`); //alert if no shares owned
    }
    if (Number(quantity) > currentPosition) {
      return alert(`You only own ${currentPosition} shares of ${ticker.toUpperCase()}. Cannot sell ${quantity} shares.`); //alert if not enough shares to sell
    }
  }

    // Add the trade to the "trades" collection in Firestore
    await addDoc(collection(db, "trades"), {
      ticker: ticker.toUpperCase(),       // ensure uppercase (e.g., AAPL)
      action,                             // "BUY" or "SELL"
      quantity: Number(quantity),         // convert string to number
      price: Number(price),               // convert string to number
      date: Timestamp.fromDate(new Date(date)), // convert input date to Firestore Timestamp
      userId: user.uid                    // associate the trade with the logged-in user
    });

    // Show confirmation and reset the form
    alert("Trade added!");
    setTicker(""); setAction("BUY"); setQuantity(""); setPrice(""); setDate("");
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
                            "XEL", "XOM", "ZS"
                            ]; // example of ticker autofills can use API to make it more comprehensive
  // The JSX returned is the UI of the form
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            style={{
              padding: "0.75rem",
              border: "none",
              borderRadius: "0.5rem",
              backgroundColor: "#2A2C4D",
              color: "white",
              fontSize: "1rem"
            }}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

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

          <button
            type="submit"
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              border: "none",
              borderRadius: "0.5rem",
              backgroundColor: "#3B82F6",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
          >
            Add Trade
          </button>
        </form>
      </div>
    </div>
  </div>
);};


export default TradeForm;
