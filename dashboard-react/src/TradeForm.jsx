// React state and lifecycle functions
import { useState, useEffect } from "react";
// Firestore and Firebase Auth
import { collection, addDoc, Timestamp } from "firebase/firestore";
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

  // This runs once when the component loads, to detect if a user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) setUser(u); // set user if logged in
    });
    return () => unsubscribe(); // clean up listener on unmount
  }, []);

  // This function handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent the page from reloading on submit

    // If not logged in, don't allow submission
    if (!user) return alert("You must be logged in to add a trade.");

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

  // The JSX returned is the UI of the form
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "2rem", color: "white" }}>
        <h2>Add Trade</h2>

        {/* Trade Input Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Ticker Field */}
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Ticker"
            required
          />

          {/* Action Dropdown */}
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>

          {/* Quantity Input */}
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            required
          />

          {/* Price Input */}
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            required
          />

          {/* Date Picker */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {/* Submit Button */}
          <button type="submit">Add Trade</button>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
