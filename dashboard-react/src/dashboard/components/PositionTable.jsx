function PositionTable({ positions }) {
  if (!positions || positions.length === 0) return <div>No positions found.</div>;

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