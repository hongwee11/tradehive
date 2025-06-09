import "./chart.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function Chart({ title, data, labels }) {
  
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const valueChange = (last - prev).toFixed(2); 
  const percentChange = ((valueChange / prev) * 100).toFixed(2);
  
  return (
    <div className="chart-container">
      {/* Flex row: title left, change badge right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 className="chart-title" style={{ margin: 0 }}>{title}</h2>
        <div
          className="chart-change"
          style={{
            color: valueChange >= 0 ? "#00ff99" : "#ff4d4f",
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: 8,
            minWidth: 110,
            textAlign: "right",
            marginLeft: 16,
            fontSize: "1rem",
            background: valueChange >= 0 ? "rgba(0,255,153,0.08)" : "rgba(255,77,79,0.08)",
          }}
        >
          {`${valueChange >= 0 ? "+" : ""}$${valueChange} (${percentChange >= 0 ? "+" : ""}${percentChange}%)`}
        </div>
      </div>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Portfolio Value",
              data,
              borderColor: "#00b4d8",
              backgroundColor: "rgba(0,180,216,0.1)",
              fill: true,
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { display: true }, y: { display: true } },
        }}
        height={300}
      />
      

    </div>
  );
}

export default Chart;