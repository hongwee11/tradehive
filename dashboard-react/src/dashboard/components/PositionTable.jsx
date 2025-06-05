import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";

function PositionTable() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch all trades for this user
      const q = query(collection(db, "trades"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      // Aggregate trades into positions
      const pos = {};
      snapshot.forEach(doc => {
        const { ticker, action, quantity, price } = doc.data();
        if (!pos[ticker]) pos[ticker] = { ticker, quantity: 0, avgPrice: 0, totalCost: 0 };
        if (action === "BUY") {
          pos[ticker].totalCost += price * quantity;
          pos[ticker].quantity += quantity;
        } else if (action === "SELL") {
          pos[ticker].quantity -= quantity;
        }
        pos[ticker].avgPrice = pos[ticker].quantity > 0 ? (pos[ticker].totalCost / pos[ticker].quantity) : 0;
      });

      setPositions(Object.values(pos).filter(p => p.quantity > 0));
      setLoading(false);
    };

    fetchPositions();
  }, []);

  if (loading) return <div>Loading positions...</div>;

  return (
    <div>
      <h2>Your Positions</h2>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Quantity</th>
            <th>Avg. Price</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos.ticker}>
              <td>{pos.ticker}</td>
              <td>{pos.quantity}</td>
              <td>${pos.avgPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PositionTable;