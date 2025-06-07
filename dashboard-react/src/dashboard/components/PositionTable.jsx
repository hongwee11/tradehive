import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase"; //retrieved from firebase.js
import { onAuthStateChanged } from "firebase/auth"; //fix issue of user being logged out when we refresh the page


const API_KEY = "a7775737d9d94745839febae0115d15a"; //12data api key

function PositionTable() {
  const [positions, setPositions] = useState([]); //store user's positions (array of objects)
  const [loading, setLoading] = useState(true); //see if data is still loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => { //deal with changes in firebaseauth state(see if user is logged in or not)
    console.log("Current user:", user); // detect who the user is
    if (!user) {
      setPositions([]);
      setLoading(false);
      return;
    }
    //if no user logged in, nothing happens

      // Fetch all trades for this user
      const q = query(collection(db, "trades"), where("userId", "==", user.uid)); //finding trades for the current user
      const snapshot = await getDocs(q); //get documents from the trades with the corresponding userid

      // sum up the respective trades to get the overall position
      const pos = {}; //create an object to store positions
      snapshot.forEach(doc => { //loop through each item in the trade
        const { ticker, action, quantity, price } = doc.data(); //data that we want to extract from the trade
        if (!pos[ticker]) pos[ticker] = { ticker, quantity: 0, avgPrice: 0, totalCost: 0 }; //
        if (action === "BUY") { //dealing with buying and selling
          pos[ticker].totalCost += price * quantity;
          pos[ticker].quantity += quantity;
        } else if (action === "SELL") {
          pos[ticker].quantity -= quantity;
        }
        pos[ticker].avgPrice = pos[ticker].quantity > 0 ? (pos[ticker].totalCost / pos[ticker].quantity) : 0;
      });

      const tickers = Object.keys(pos);
      console.log("Tickers to fetch:", tickers); //determine what tickers to look for
      //determine unique tickers
      const prices = {};
      for (const ticker of tickers) {
        try {
          const resp = await fetch(
            `https://api.twelvedata.com/price?symbol=${ticker}&apikey=${API_KEY}`
          ); // live prices user 12data api
          const data = await resp.json();
          prices[ticker] = parseFloat(data.price); //store live prices
        } catch (e) {
          prices[ticker] = null; //if dont exist store as null
        }
      }
      

      const positionsWithPrices = Object.values(pos)
        .filter(p => p.quantity > 0)
        .map(p => ({
          ...p,
          livePrice: prices[p.ticker] || 0,
          marketValue: (prices[p.ticker] || 0) * p.quantity,
        }));
        //combine table with live prices and calcualte market value

      setPositions(positionsWithPrices); //update with the final positions
      setLoading(false); // data load finish
    });

    return () => unsubscribe(); 
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
            <th>Live Price</th>
            <th>Market Value</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos.ticker}>
              <td>{pos.ticker}</td>
              <td>{pos.quantity}</td>
              <td>${pos.avgPrice.toFixed(2)}</td>
              <td>{pos.livePrice ? `$${pos.livePrice.toFixed(2)}` : "N/A"}</td>
              <td>{pos.marketValue ? `$${pos.marketValue.toFixed(2)}` : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PositionTable;