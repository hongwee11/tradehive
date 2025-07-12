import React, { useState } from 'react';
import Sidebar from '../dashboard/components/sidebar';
import './projection.css';

const allowedTickers = ["AAPL", "ABBV", "ABNB", "ABT", "ACN", "ADBE", "AEP", "AIG", "AMD", "AMAT",
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
    "TWTR", "UBER", "UPST", "ZM", "ARKK", "QQQ", "SPY", "IWM", "DIA", "SQQQ"];

function ProjectionsPage() {
  // Current earnings data (static for now)
  const currentEarnings = {
    eps: 20.92,
    pe: 4.11,
    epsGrowth: 31.5
  };
  const [ticker, setTicker] = useState('');
  const [epsTTM, setEpsTTM] = useState('');
  const [epsGrowthRate, setEpsGrowthRate] = useState('');
  const [epsMultiple, setEpsMultiple] = useState('');
  const [desiredReturn, setDesiredReturn] = useState('');




  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="projections-main">
        <h1 className="projections-title">Stock Projections</h1>
        
        <div className="ticker-input-container">
          <div className="ticker-input-card">
            <label className="ticker-label">Enter Stock Ticker Symbol</label>
            <div className="ticker-input-group">
              <input 
                type="text" 
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="ticker-input"
                placeholder="e.g., AAPL, MSFT, TSLA"
              />
              <button className="fetch-data-button">
                Fetch Live Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="projections-container">
          {/* Left Column - Assumptions */}
          <div className="assumptions-column">
            <div className="assumptions-card">
              <h2 className="section-title">Assumptions</h2>
              
              {/* Current Earnings Section */}
              <div className="current-earnings-section">
                <h3 className="subsection-title">Current Earnings</h3>
                
                <div className="earnings-grid">
                  <div className="earnings-item">
                    <span className="earnings-label">EPS (TTM)</span>
                    <span className="earnings-value">${currentEarnings.eps}</span>
                  </div>
                  
                  <div className="earnings-item">
                    <span className="earnings-label">P/E TTM</span>
                    <span className="earnings-value">{currentEarnings.pe}</span>
                  </div>
                  
                  <div className="earnings-item">
                    <span className="earnings-label">EPS Growth</span>
                    <span className="earnings-value">{currentEarnings.epsGrowth}%</span>
                  </div>
                </div>
              </div>

              <div className="inputs-section">
                <div className="input-group">
                  <label className="input-label">EPS (TTM)</label>
                  <input 
                    type="number" 
                    value={epsTTM}
                    onChange={(e) => setEpsTTM(e.target.value)}
                    className="projection-input"
                    placeholder="Enter EPS"
                  />
                  <small className="input-help">The Earnings Per Share over the last 12 months</small>
                </div>

                <div className="input-group">
                  <label className="input-label">EPS Growth Rate</label>
                  <div className="input-with-icon">
                    <input 
                      type="number" 
                      value={epsGrowthRate}
                      onChange={(e) => setEpsGrowthRate(e.target.value)}
                      className="projection-input"
                      placeholder="Enter growth rate"
                    />
                    <span className="input-icon">%</span>
                  </div>
                  <small className="input-help">Your assumption of the company's expected yearly EPS growth rate over the next 5 years</small>
                </div>

                <div className="input-group">
                  <label className="input-label">Appropriate EPS Multiple</label>
                  <input 
                    type="number" 
                    value={epsMultiple}
                    onChange={(e) => setEpsMultiple(e.target.value)}
                    className="projection-input"
                    placeholder="Enter P/E ratio"
                  />
                  <small className="input-help">The PE ratio you consider appropriate for the stock in trade-up</small>
                </div>

                <div className="input-group">
                  <label className="input-label">Desired Return</label>
                  <div className="input-with-icon">
                    <input 
                      type="number" 
                      value={desiredReturn}
                      onChange={(e) => setDesiredReturn(e.target.value)}
                      className="projection-input"
                      placeholder="Enter desired return"
                    />
                    <span className="input-icon">%</span>
                  </div>
                  <small className="input-help">The minimum yearly return you want to achieve from this investment</small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Projection Chart */}
          <div className="projection-column">
            <div className="projection-card">
              <h2 className="section-title">5-Year Projection</h2>
              
              {/* Calculation Results */}
              <div className="calculation-results">
                <h3 className="subsection-title">Calculation Results</h3>
                
                <div className="results-grid">
                  <div className="result-item">
                    <span className="result-label">Return from today's price</span>
                    <span className="result-value highlight">Filler</span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Entry Price for 15% Return</span>
                    <span className="result-value">Filler</span>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="chart-placeholder">
                <p>Chart will go here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProjectionsPage;