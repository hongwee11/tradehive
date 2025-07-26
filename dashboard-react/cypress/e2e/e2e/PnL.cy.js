describe('PnL Integration Test', () => {
  const email = 'potato5@gmail.com';
  const password = 'testing';

  it('tests profit and loss calculations with buy/sell trades', () => {
    // Login
    cy.visit('http://localhost:3000');
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type(password);
    cy.contains('Login').click();
    cy.url().should('include', '/dashboard');

    // Test 1: Profitable trade (Buy $150, Sell $160 = +$10 PnL)
    // Buy 1 share of AAPL at $150 on 20/
    cy.contains('Add Trade').click();
    cy.get('input[placeholder="Ticker"]').type('AAPL');
    cy.get('input[placeholder="Quantity"]').type('1');
    cy.get('input[placeholder="Price Per Share"]').type('150');
    cy.get('input[type="date"]').type('2025-07-20');
    cy.contains('BUY').click();

    // Sell 1 share of AAPL at $160 
    cy.contains('Add Trade').click();
    cy.get('input[placeholder="Ticker"]').clear().type('AAPL');
    cy.get('input[placeholder="Quantity"]').clear().type('1');
    cy.get('input[placeholder="Price Per Share"]').clear().type('160');
    cy.get('input[type="date"]').clear().type('2025-07-20');
    cy.contains('SELL').click();

    // Check dashboard for +$10 PnL
    cy.contains('Home').click();
    cy.contains('$10').should('exist'); // Should show $10 profit

    // Test 2: Reset with losing trade (Buy $160, Sell $150 = -$10 PnL)
    // Buy 1 share of AAPL at $160 on 20/7
    cy.contains('Add Trade').click();
    cy.get('input[placeholder="Ticker"]').type('AAPL');
    cy.get('input[placeholder="Quantity"]').type('1');
    cy.get('input[placeholder="Price Per Share"]').type('160');
    cy.get('input[type="date"]').type('2025-07-20');
    cy.contains('BUY').click();

    // Sell 1 share of AAPL at $150 on 20/7
    cy.contains('Add Trade').click();
    cy.get('input[placeholder="Ticker"]').clear().type('AAPL');
    cy.get('input[placeholder="Quantity"]').clear().type('1');
    cy.get('input[placeholder="Price Per Share"]').clear().type('150');
    cy.get('input[type="date"]').clear().type('2025-07-20');
    cy.contains('SELL').click();

    // Check dashboard for $0 total PnL (should be reset)
    cy.contains('Home').click();
    cy.contains('$0').should('exist'); // Should show $0 total PnL
    });
  });
