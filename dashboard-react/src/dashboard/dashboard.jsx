/* global __app_id */ // I'm only keeping __app_id here since it's the only global used directly in this file
// Import core React features
import React, { useState, useEffect } from "react"; // I've fixed this import path back to "react"

// Import custom components
import Sidebar from "./components/sidebar";
import Chart from "./components/chart";
import PositionTable from "./components/PositionTable";
import TradeHistory from "./components/tradehistory";

// Import Firestore tools
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore"; // I added doc and setDoc here for Firestore updates

// Import Firebase configuration
import { db, auth } from "../firebase";

// Import styles
import "./dashboard.css";

// Twelve Data API key for fetching stock prices
const API_KEY = "a7775737d9d94745839febae0115d15a";

// I'm getting my app ID from the global canvas environment for Firestore paths
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Utility function to get the past 7 days in YYYY-MM-DD format
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// Main dashboard component
function Dashboard() {
  // State variables
  const [positions, setPositions] = useState([]);              // Array of current stock positions
  const [totalValue, setTotalValue] = useState(0);             // Total current market value
  const [totalPositions, setTotalPositions] = useState(0);     // Total cost basis
  const [portfolioHistory, setPortfolioHistory] = useState([]); // Historical portfolio values
  const [loading, setLoading] = useState(true);                // Loading state
  const [realizedPnL, setRealizedPnL] = useState(0);           // Realized profit and loss
  const [pnlPercentage, setPnlPercentage] = useState(0);       // My new state for PnL percentage

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser; // Get current user from Firebase Auth
      if (!user) {
        console.log("User not logged in. Cannot fetch data.");
        setLoading(false);
        return;
      }

      setLoading(true); // Start loading

      try {
        // 1. Get all trades for the logged-in user
        const q = query(collection(db, "trades"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);

        const trades = [];
        // Normalize and collect trades
        snapshot.forEach(doc => {
          const data = doc.data();
          trades.push({
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString().slice(0, 10) : data.date
          });
        });

        // Sort trades by date (ascending)
        trades.sort((a, b) => {
          const dateCompare = new Date(a.date) - new Date(b.date);
          if (dateCompare !== 0) return dateCompare;

          // Sort dates by buy/sell (for the bug fix)
          if (a.action === "BUY" && b.action === "SELL") return -1; // BUY comes before SELL
          if (a.action === "SELL" && b.action === "BUY") return 1; // SELL comes after BUY
          return 0;
        });

        // 2. Calculate current holdings and realized P&L
        const pos = {}; // Object to track each stock's position
        let totalRealizedPnL = 0; // Total realized P&L

        trades.forEach(({ ticker, action, quantity, price }) => {
          if (!pos[ticker]) {
            pos[ticker] = { ticker, quantity: 0, totalInvested: 0 };
          }

          if (action === "BUY") {
            pos[ticker].totalInvested += price * quantity;
            pos[ticker].quantity += quantity;
          } else if (action === "SELL") {
            if (pos[ticker].quantity > 0) {
              const avgCost = pos[ticker].totalInvested / pos[ticker].quantity;
              const qtyToSell = Math.min(quantity, pos[ticker].quantity);

              const gainLoss = (price - avgCost) * qtyToSell;
              totalRealizedPnL += gainLoss;

              pos[ticker].totalInvested -= avgCost * qtyToSell;
              pos[ticker].quantity -= qtyToSell;

              if (pos[ticker].quantity === 0) {
                pos[ticker].totalInvested = 0;
              }
            } else {
              console.warn(`Invalid sell: ${ticker}, qty: ${quantity}`);
            }
          }

          // Update average price
          pos[ticker].avgPrice = pos[ticker].quantity > 0
            ? pos[ticker].totalInvested / pos[ticker].quantity
            : 0;
        });

        // Save realized P&L to state
        setRealizedPnL(totalRealizedPnL);

        // 3. Calculate total cost basis of current holdings
        let totalCostBasis = 0;
        for (const ticker in pos) {
          if (pos[ticker].quantity > 0) {
            totalCostBasis += pos[ticker].totalInvested;
          }
        }
        setTotalPositions(totalCostBasis);

        // 4. Fetch live prices and calculate market value
        let marketValue = 0;
        const positionsArr = [];
        const activeTickers = Object.keys(pos).filter(t => pos[t].quantity > 0);

        await Promise.all(
          activeTickers.map(async (ticker) => {
            let livePrice = 0;
            try {
              const resp = await fetch(`https://api.twelvedata.com/price?symbol=${ticker}&apikey=${API_KEY}`);
              const data = await resp.json();
              livePrice = parseFloat(data.price) || 0;
            } catch (e) {
              console.error(`Price error: ${ticker}`, e);
            }

            const value = livePrice * pos[ticker].quantity;
            marketValue += value;

            positionsArr.push({
              ...pos[ticker],
              livePrice,
              marketValue: value,
              gainLoss: value - pos[ticker].totalInvested
            });
          })
        );

        setPositions(positionsArr);       // Set stock positions
        setTotalValue(marketValue);       // Set total market value

        // 5. Get historical value for the last 7 days
        const last7Days = getLast7Days();
        const uniqueTickers = Array.from(new Set(trades.map(t => t.ticker)));

        const priceMap = {};
        await Promise.all(
          uniqueTickers.map(async (ticker) => {
            try {
              const resp = await fetch(`https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=7&apikey=${API_KEY}`);
              const data = await resp.json();
              priceMap[ticker] = data.values ? data.values.reverse() : [];
            } catch (e) {
              console.error(`History price error: ${ticker}`, e);
              priceMap[ticker] = [];
            }
          })
        );

        const historyValues = [];

        // Compute portfolio value for each of the past 7 days
        for (let i = 0; i < last7Days.length; i++) {
          const date = last7Days[i];
          const snapshotPositions = {};

          // Simulate positions as of that day
          const tradesUntilDate = trades.filter(trade => trade.date <= date);
          tradesUntilDate.forEach(trade => {
            if (!snapshotPositions[trade.ticker]) {
              snapshotPositions[trade.ticker] = { quantity: 0, totalInvested: 0 };
            }

            if (trade.action === "BUY") {
              snapshotPositions[trade.ticker].quantity += trade.quantity;
              snapshotPositions[trade.ticker].totalInvested += trade.price * trade.quantity;
            } else if (trade.action === "SELL") {
              if (snapshotPositions[trade.ticker].quantity > 0) {
                const avgPrice = snapshotPositions[trade.ticker].totalInvested / snapshotPositions[trade.ticker].quantity;
                const qtyToSell = Math.min(trade.quantity, snapshotPositions[trade.ticker].quantity);
                snapshotPositions[trade.ticker].totalInvested -= avgPrice * qtyToSell;
                snapshotPositions[trade.ticker].quantity -= qtyToSell;
                if (snapshotPositions[trade.ticker].quantity === 0) {
                  snapshotPositions[trade.ticker].totalInvested = 0;
                }
              }
            }
          });

          // Add up value for the day using historical close prices
          let dayValue = 0;
          for (const ticker of uniqueTickers) {
            const priceEntry = priceMap[ticker] ? priceMap[ticker][i] : undefined;
            if (snapshotPositions[ticker] && snapshotPositions[ticker].quantity > 0 && priceEntry) {
              dayValue += snapshotPositions[ticker].quantity * parseFloat(priceEntry.close);
            }
          }

          historyValues.push(dayValue);
        }

        setPortfolioHistory(historyValues); // Set 7-day portfolio history

        // My new logic to calculate and save PnL percentage for the leaderboard
        let currentPnlPercentage = 0;
        if (totalCostBasis > 0) {
          // Calculate PnL percentage based on current market value vs. total cost basis
          currentPnlPercentage = ((marketValue - totalCostBasis) / totalCostBasis) * 100;
        } else if (marketValue > 0) {
          // If no cost basis but value exists (e.g., gifted stock), consider it 100% gain for simplicity
          currentPnlPercentage = 100;
        }
        setPnlPercentage(currentPnlPercentage); // Update my PnL percentage state

        // Now, I'm saving the PnL percentage to Firestore for the leaderboard
        const userProfileRef = doc(db, `artifacts/${appId}/public/data/userProfiles`, user.uid);
        await setDoc(userProfileRef, {
          displayName: user.displayName || `User_${user.uid.substring(0, 6)}`, // Using user's display name or a default
          pnlPercentage: parseFloat(currentPnlPercentage.toFixed(2)), // Storing it as a number with 2 decimal places
          lastUpdated: new Date().toISOString(), // Adding a timestamp for when it was last updated
        }, { merge: true });

      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setLoading(false); // Finish loading
      }
    }

    fetchData(); // Trigger data load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser?.uid]); // I'm making sure this effect re-runs if the user changes

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="dashboard-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <h2>Loading Portfolio Data...</h2>
      </div>
    );
  }

  // Prepare chart labels and gain/loss numbers
  const tempLabels = getLast7Days();
  const daysChange = portfolioHistory.length >= 2
    ? (portfolioHistory[portfolioHistory.length - 1] - portfolioHistory[portfolioHistory.length - 2])
    : 0;
  const gainLoss = totalValue - totalPositions;

  // Dashboard UI
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Top widgets showing key portfolio stats */}
        <div className="dashboard-top-row">
          <div className="widget widget-portfolio-value">Your Portfolio Value: ${totalValue.toFixed(2)}</div>
          <div className="widget widget-gain-loss">Total Gain/Loss: ${gainLoss.toFixed(2)}</div>
          <div className="widget widget-daily-change">Day's Change: ${daysChange.toFixed(2)}</div>
          <div className="widget widget-realized-pnl">Realized P&L: ${realizedPnL.toFixed(2)}</div>
          {/* I'm adding my new PnL percentage display here */}
          <div className="widget widget-pnl-percentage">PnL Percentage: {pnlPercentage.toFixed(2)}%</div>
        </div>

        {/* Middle row: chart and recent trades */}
        <div className="dashboard-main-row">
          <div className="dashboard-main-left">
            <div className="widget widget-performance-chart">
              <Chart title="Portfolio Value Over Time" data={portfolioHistory} labels={tempLabels} />
            </div>
          </div>
          <div className="dashboard-main-right">
            <div className="widget widget-recent-trades">
              <TradeHistory />
            </div>
          </div>
        </div>

        {/* Bottom row: holdings table */}
        <div className="holdings">
          <PositionTable positions={positions} />
        </div>
      </main>
    </div>
  );
}

// Export dashboard for use in router/app
export default Dashboard;