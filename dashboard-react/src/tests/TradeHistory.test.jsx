import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TradeHistory from "../dashboard/components/tradehistory";

// Mock Firestore getDocs to return a single trade
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: "trade1",
          data: () => ({
            ticker: "AAPL",
            action: "buy",
            quantity: 1.5,
            price: 175.23,
            date: {
              toDate: () => new Date("2023-08-01"),
            },
          }),
        },
      ],
    })
  ),
}));

// Mock Firebase Auth to simulate logged-in user
jest.mock("../firebase", () => ({
  db: {},
  auth: {
    currentUser: {
      uid: "mock-user-id",
    },
  },
}));

describe("TradeHistory", () => {
  it("displays the trade after making a trade", async () => {
    render(<TradeHistory />);

    // Initially, loading text might be shown
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for the trade ticker to appear on screen
    await waitFor(() => expect(screen.getByText(/AAPL/i)).toBeInTheDocument());

    // Optional: check other details like action or price
    expect(screen.getByText(/buy/i)).toBeInTheDocument();
  });
});
