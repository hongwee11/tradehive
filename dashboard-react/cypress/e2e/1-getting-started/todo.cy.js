// cypress/e2e/app-flow.cy.js
describe('TradeHive E2E Flow', () => {
  const email = 'potato2@gmail.com';
  const password = 'testing';

  it('logs in, adds a trade, posts on forum, and uses projection', () => {
    // Login
    cy.visit('http://localhost:3000');
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Password"]').type(password);
    cy.contains('Login').click();

    // Wait for dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Your Portfolio Value').should('exist');

    // Add Trade
    cy.contains('Add Trade').click();
    cy.url().should('include', '/trade');
    cy.get('input[placeholder="Ticker"]').type('AAPL');
    cy.get('input[placeholder="Quantity"]').type('1');
    cy.get('input[placeholder="Price Per Share"]').type('150');
    cy.get('input[type="date"]').type(new Date().toISOString().split('T')[0]);
    cy.contains('BUY').click();
    cy.on('window:alert', (txt) => {
      expect(txt).to.contains('trade added');
    });

    // Post on Forum
    cy.contains('Forum').click();
    cy.url().should('include', '/forum');
    cy.contains('+ Create a Post').click();
    cy.url().should('include', '/forum/create');
    cy.get('input[placeholder="Your insightful title here"]').type('Test Post');
    cy.get('textarea[placeholder="Share your detailed trade idea, analysis, and reasoning..."]').type('This is a test post.');
    cy.contains('Submit Post').click();
    cy.contains('Test Post').should('exist');

    // Go back to forum home
    cy.contains('Back to Home').click();

    // Trade Projection
    cy.contains('Projection').click();
    cy.url().should('include', '/projection');
    cy.get('input[placeholder="Enter EPS (TTM)"]').clear().type('5');
    cy.get('input[placeholder="Enter current price"]').clear().type('150');
    cy.get('input[placeholder="Enter EPS"]').clear().type('10');
    cy.get('input[placeholder="Enter P/E ratio"]').clear().type('20');
    cy.get('input[placeholder="Enter desired return"]').clear().type('15');
    cy.contains('Calculation Results').should('exist');
  });
});