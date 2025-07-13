import React, { useState } from 'react';
import Sidebar from '../dashboard/components/sidebar';
import './projection.css';

function ProjectionsPage() {
  // Current earnings data (static for now)
  const [epsTTM, setEpsTTM] = useState('');
  const [peTTM, setPeTTM] = useState('');
  const [epsGrowthRate, setEpsGrowthRate] = useState('');
  const [epsMultiple, setEpsMultiple] = useState('');
  const [desiredReturn, setDesiredReturn] = useState('');
  const [currPrice, setCurrPrice] = useState('');




  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="projections-main">
        <h1 className="projections-title">Stock Projections</h1>
        <div className="projections-container">
          {/* Left Column - Assumptions */}
          <div className="assumptions-column">
            <div className="assumptions-card">
              
              {/* Current Earnings Section */}
              <div className="current-earnings-section">
                <h3 className="subsection-title">Current Data</h3>
                
                <div className="earnings-grid">
                  <div className="earnings-item">
                    <span className="earnings-label">EPS (TTM)</span>
                    <input
                      type="number"
                      value={epsTTM}
                      onChange={(e) => setEpsTTM(e.target.value)}
                      className="projection-input"
                      placeholder="Enter EPS"
                    />
                  </div>
                  
                  <div className="earnings-item">
                    <span className="earnings-label">P/E TTM</span>
                    <input
                      type="number"
                      value={peTTM}
                      onChange={(e) => setPeTTM(e.target.value)}
                      className="projection-input"
                      placeholder="Enter P/E"
                    />
                  </div>
                  
                  <div className="earnings-item">
                    <span className="earnings-label">Current Price</span>
                    <input
                      type="dollar"
                      value={currPrice}
                      onChange={(e) => setCurrPrice(e.target.value)}
                      className="projection-input"
                      placeholder="Enter current price"
                    />
                  </div>
                </div>
              </div>
            <h3 className="subsection-title">Assumptions</h3>

              <div className="inputs-section">
                <div className="input-group">
                  <label className="input-label">EPS Growth Rate</label>
                  <input 
                    type="number" 
                    value={epsGrowthRate}
                    onChange={(e) => setEpsGrowthRate(e.target.value)}
                    className="projection-input"
                    placeholder="Enter EPS"
                  />
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