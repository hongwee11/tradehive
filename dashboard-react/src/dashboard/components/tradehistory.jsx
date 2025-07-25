import "./tradehistory.css";
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      const user = auth.currentUser;
      if (!user) {
        setTrades([]);
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, "trades"),
        where("userId", "==", user.uid), //filter by user id
        orderBy("date", "desc"), //order of trades by date
        limit(5) // take the top 5 most recent trades
      );
      const snapshot = await getDocs(q); 
      const tradeList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
        };
      });
      setTrades(tradeList);
      setLoading(false);
    };
    fetchTrades();
  }, []);

  if (loading) return <div className="tradehistory">Loading recent trades...</div>;
  if (trades.length === 0) return <div className="tradehistory">No recent trades.</div>;

  return (
    <div className="tradehistory">
      <h3>Recent Trades</h3>
      <ul>
        {trades.map(trade => (
          <li key={trade.id}>
            {/* Display trade details */}
            <b>{trade.ticker}</b> — {trade.action} {trade.quantity} @ ${trade.price} <br />
            <small>{trade.date.toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TradeHistory;