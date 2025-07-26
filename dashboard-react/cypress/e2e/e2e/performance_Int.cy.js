describe('Portfolio Performance Integration Test', () => {
  const email = 'potato5@gmail.com';
  const password = 'testing';

  it('adds multiple trades and verifies portfolio calculations update correctly', () => {
    // Login
    cy.visit('http://localhost:3000');
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type(password);
    cy.contains('Login').click();
    cy.url().should('include', '/dashboard');

    // Add first trade (AAPL)
    cy.contains('Add Trade').click();
    cy.get('input[placeholder="Ticker"]').type('AAPL');
    cy.get('input[placeholder="Quantity"]').type('5');
    cy.get('input[placeholder="Price Per Share"]').type('100');
    cy.get('input[type="date"]').type('2025-07-22');
    cy.contains('BUY').click();

    // Add second trade (AAPL)
    cy.contains('Add Trade').click();
    cy.get('input[placeholder="Ticker"]').clear().type('AAPL');
    cy.get('input[placeholder="Quantity"]').clear().type('5');
    cy.get('input[placeholder="Price Per Share"]').clear().type('200');
    cy.get('input[type="date"]').clear().type('2025-07-22');
    cy.contains('BUY').click();

    // Return to dashboard and verify portfolio calculations
    cy.contains('Home').click();
    cy.contains('AAPL').should('exist');
    
    // But you mentioned it should be $150, so adjust the calculation or expected value
    cy.contains('AAPL').parent().contains('150'); // Average price per share should be 150
    cy.contains('10').should('exist'); // Total quantity

    //Sell off the position so it doesn't affect future testing
    cy.contains('Add Trade').click();
    cy.get('input[placeholder="Ticker"]').type('AAPL');
    cy.get('input[placeholder="Quantity"]').type('10');
    cy.get('input[placeholder="Price Per Share"]').type('150');
    cy.get('input[type="date"]').type('2025-07-22');
    cy.contains('SELL').click();
  });
});