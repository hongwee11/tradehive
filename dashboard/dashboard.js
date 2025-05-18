console.log('Script loaded successfully! Ready to build!');

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    const chartData = [1000, 1200, 1500, 1300, 1700, 1500]; // Example data
    const portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 
            datasets: [{
                label: 'Portfolio Value',
                data: chartData,
                borderColor: '#00b4d8',
                backgroundColor: 'rgba(0,180,216,0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: true },
                y: { display: true }
            }
        }
    });

    //% change in portfolio value
    const last = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    const valueChange = last - prev;
    const percentChange = ((valueChange / prev) * 100).toFixed(2);

    const changeDiv = document.getElementById('portfolioChange');
    changeDiv.textContent = `${valueChange >= 0 ? '+' : ''}$${valueChange} (${percentChange >= 0 ? '+' : ''}${percentChange}%)`;
    if (valueChange >= 0) {
        changeDiv.style.color = '#00ff99';
        changeDiv.style.background = 'rgba(0,255,153,0.08)';
    } else {
        changeDiv.style.color = '#ff4d4f';
        changeDiv.style.background = 'rgba(255,77,79,0.08)';
    }
});