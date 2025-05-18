console.log('Script loaded successfully! Ready to build!');

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    const portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Example months
            datasets: [{
                label: 'Portfolio Value',
                data: [3000, 3200, 3500, 4000, 4200, 5000], // Example values
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
});