import React, { useState } from 'react';
import Sidebar from '../dashboard/components/sidebar';
import './projection.css';

function ProjectionsPage() {
  // Current earnings data (static for now)
  const [epsTTM, setEpsTTM] = useState('');
  const [epsGrowthRate, setEpsGrowthRate] = useState('');
  const [epsMultiple, setEpsMultiple] = useState('');
  const [desiredReturn, setDesiredReturn] = useState('');
  const [currPrice, setCurrPrice] = useState('');
  
  const calculateProjections = () => {
    const eps = parseFloat(epsTTM) || 0;
    const growthRate = parseFloat(epsGrowthRate) || 0;
    const multiple = parseFloat(epsMultiple) || 0;
    const currentPrice = parseFloat(currPrice) || 0;
    const desiredRet = parseFloat(desiredReturn) || 15;

    if (!eps || !growthRate || !multiple || !currentPrice) {
      return {
        futureEPS: 0,
        targetPrice: 0,
        annualReturn: 0,
        entryPrice: 0
      };
    }

    const futureEPS = eps * Math.pow(1 + growthRate / 100, 5);
    
    // 2. Calculate target price
    const targetPrice = futureEPS * multiple;
    
    // 3. Calculate annual return from current price
    const annualReturn = (Math.pow(targetPrice / currentPrice, 1/5) - 1) * 100;
    
    // 4. Calculate entry price for desired return
    const entryPrice = targetPrice / Math.pow(1 + desiredRet / 100, 5);

    return {
      futureEPS: futureEPS.toFixed(2),
      targetPrice: targetPrice.toFixed(2),
      annualReturn: annualReturn.toFixed(1),
      entryPrice: entryPrice.toFixed(2)
    };
  };

  const projections = calculateProjections();



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
                  <div className="input-with-icon"> 
                    <input
                        type="number" 
                        value={epsGrowthRate}
                        onChange={(e) => setEpsGrowthRate(e.target.value)}
                        className="projection-input"
                        placeholder="Enter EPS"
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
                    <span className="result-value highlight">{projections.annualReturn}% annually</span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Entry Price for {desiredReturn || 15 }% Return</span>
                    <span className="result-value">${projections.entryPrice}</span>
                  </div>

                  <div className="result-item">
                    <span className="result-label">5-Year Target Price</span>
                    <span className="result-value">
                        ${projections.targetPrice}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Future EPS (5Y)</span>
                    <span className="result-value">
                        ${projections.futureEPS}
                    </span>
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