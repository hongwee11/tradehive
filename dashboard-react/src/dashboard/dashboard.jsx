import React, { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Chart from "./components/chart";
import PositionTable from "./components/PositionTable";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./dashboard.css";
//Processsing data for the chart in dashboard or chart itself?
const API_KEY = "a7775737d9d94745839febae0115d15a";
//generate the last 7 dates
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10)); // Format: YYYY-MM-DD
  }
  return days;
}



function Dashboard() {
  const [positions, setPositions] = useState([]); //what stocks the user has together with their quantities, avg prices, etc.
  const [totalValue, setTotalValue] = useState(0); // total mkt value of all positions
  const [totalPositions, setTotalPositions] = useState(0); //total cost basis of all positions
  const [portfolioHistory, setPortfolioHistory] = useState([]);//portfolio value of the last 7 days

  useEffect(() => {
  async function fetchData() {
    const user = auth.currentUser; //getting id of the user
    if (!user) return;

    // Fetch trades
    const q = query(collection(db, "trades"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    // Prepare trades array with date as string
    const trades = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      trades.push({
        ...data, // copy all the data from the dataset
        date: data.date?.toDate ? data.date.toDate().toISOString().slice(0, 10) : data.date //override date to string format 
      });
    });

    const pos = {}; //creating a new object to hold positions
    trades.forEach(({ ticker, action, quantity, price }) => { //looping through trades
      if (!pos[ticker]) pos[ticker] = { ticker, quantity: 0, avgPrice: 0, totalCost: 0 }; // if ticker does not currently exist, create it with default values
      if (action === "BUY") { // how to handle buy and sell actions
        pos[ticker].totalCost += price * quantity;
        pos[ticker].quantity += quantity;
      } else if (action === "SELL") {
        pos[ticker].quantity -= quantity;
      }
      pos[ticker].avgPrice = pos[ticker].quantity > 0 ? (pos[ticker].totalCost / pos[ticker].quantity) : 0;
    });

    let costBasis = 0; //total amount paid for all positions
    for (const ticker of Object.keys(pos)) {
      if (pos[ticker].quantity > 0) { //only allow longs so positions should be > 0
        costBasis += pos[ticker].quantity * pos[ticker].avgPrice; // how to caluclate cost basis
      }
    }
    setTotalPositions(costBasis); // set total positions to cost basis

    let total = 0; // finding the total market value of all positions
    const positionsArr = [];
    for (const ticker of Object.keys(pos)) {
      if (pos[ticker].quantity <= 0) continue; // in case position < 0 which should not happen
      let livePrice = 0;
      try {
        const resp = await fetch(
          `https://api.twelvedata.com/price?symbol=${ticker}&apikey=${API_KEY}` //retrieving live price of the stock from 12 data API
        );
        const data = await resp.json(); //wait for http response
        livePrice = parseFloat(data.price) || 0; // parse the price, if it fails then it is 0
      } catch (e) {}
      const marketValue = livePrice * pos[ticker].quantity; // how to calculate market value of the position
      total += marketValue; // add to total market value
      positionsArr.push({
        ...pos[ticker],
        livePrice,
        marketValue,
      }); // push the position to the array
    }
    setPositions(positionsArr); // set positions to the array of positions
    setTotalValue(total); // set total value to the total market value

    // Calculate portfolio value for last 7 days
    const last7Days = getLast7Days(); // generate the dates of the last 7 days using method defined above
    const tickers = Array.from(new Set(trades.map(t => t.ticker))); //determine unique tickers from trades
    const priceMap = {}; // create a map to hold prices for each ticker
    for (const ticker of tickers) {
      const resp = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=7&apikey=${API_KEY}` // fetch historical prices for each ticker
      );
      const data = await resp.json();
      priceMap[ticker] = data.values ? data.values.reverse() : [];
    }

    const history = []; // array to hold portfolio value for each of the last 7 days
    for (let i = 0; i < last7Days.length; i++) { //for loop to faciliate this
      const date = last7Days[i];
      // Calculate positions as of this date
      const positionsForDay = {}; // object to hold positions for each date
      trades.forEach(trade => { //loop through trades
        if (trade.date <= date) {
          if (!positionsForDay[trade.ticker]) positionsForDay[trade.ticker] = 0; // if ticker does not exist, create it
          positionsForDay[trade.ticker] += trade.action === "BUY" ? trade.quantity : -trade.quantity; // add or subtract quantity based on action
        }
      });
      // Calculate value for this date
      let dayTotal = 0; //starting value for the day
      for (const ticker of tickers) {
        const priceEntry = priceMap[ticker][i]; // get the price entry for the ticker on this date
        if (positionsForDay[ticker] > 0 && priceEntry) {
          dayTotal += positionsForDay[ticker] * parseFloat(priceEntry.close); // calculate the total value for the day by multiplying quantity by price
        }
      }
      history.push(dayTotal); // push the total value for the day to the history array
    }
    setPortfolioHistory(history); // set portfolio history to the history array
  }

  fetchData();
  }, []);

  const tempLabels = getLast7Days();
  const daysChange = portfolioHistory[portfolioHistory.length - 1] - portfolioHistory[portfolioHistory.length - 2];
  const gainLoss = totalValue - totalPositions;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Top */}
        <div className="dashboard-top-row">
          <div className="widget widget-portfolio-value">Your Portfolio Value: ${totalValue.toFixed(2)}</div>
          <div className="widget widget-gain-loss">Total Gain/Loss: ${gainLoss.toFixed(2)} </div>
          <div className="widget widget-daily-change">Day's Change: ${daysChange.toFixed(2)}
          </div>
        </div>
        
        {/* Middle */}
        <div className="dashboard-main-row">
          <div className="dashboard-main-left">
            <div className="widget widget-performance-chart">
              <Chart title="Portfolio Value Over Time" data={portfolioHistory} labels={tempLabels} />
          </div>
        </div>
        <div className="dashboard-main-right">
            <div className="widget widget-recent-trades">
              Recent Trades
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="holdings">
          <PositionTable positions={positions} />
        </div>
      </main>
    </div>
  );
}


export default Dashboard;