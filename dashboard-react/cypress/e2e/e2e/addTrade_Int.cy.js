describe('TradeHive Integration Test - Add and Sell Trade', () => {
  const email = 'potato5@gmail.com';
  const password = 'testing';

  it('logs in, adds a trade, verifies on dashboard, sells trade, and verifies cleared', () => {
    // Login
    cy.visit('http://localhost:3000');
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type(password);
    cy.contains('Login').click();

    // Add Trade (Buy on 24/7/25)
    cy.contains('Add Trade').click();
    cy.url().should('include', '/trade');
    cy.get('input[placeholder="Ticker"]').type('AAPL');
    cy.get('input[placeholder="Quantity"]').type('10');
    cy.get('input[placeholder="Price Per Share"]').type('150');
    cy.get('input[type="date"]').type('2025-07-24'); // 24/7/25
    cy.contains('BUY').click();
    
    // Wait for trade confirmation
    cy.on('window:alert', (txt) => {
      expect(txt).to.contains('trade added');
    });

    // Go back to dashboard and verify trade exists
    cy.contains('Home').click();
    cy.contains('AAPL').should('exist');
    cy.contains('10').should('exist'); // Quantity
    cy.contains('$150').should('exist'); // Price

    // Sell the trade (Sell on 25/7/25)
    cy.contains('Add Trade').click();
    cy.url().should('include', '/trade');
    cy.get('input[placeholder="Ticker"]').clear().type('AAPL');
    cy.get('input[placeholder="Quantity"]').clear().type('10');
    cy.get('input[placeholder="Price Per Share"]').clear().type('150');
    cy.get('input[type="date"]').clear().type('2025-07-25'); // 25/7/25
    cy.contains('SELL').click(); // Select SELL instead of BUY
    
    // Wait for sell confirmation
    cy.on('window:alert', (txt) => {
      expect(txt).to.contains('trade added');
    });

    // Go back to dashboard and verify trade is cleared/position is zero
    cy.contains('Home').click();

    
    // Verify either the trade is gone or quantity shows 0
    // This depends on how your app handles sold positions
    cy.get('body').then(($body) => {
      if ($body.text().includes('AAPL')) {
        // If AAPL still shows, verify quantity is 0
        cy.contains('0').should('exist');
      }
      // If AAPL doesn't show at all, that's also valid (position cleared)
    });
  });
});