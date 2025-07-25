/* global __app_id */ // I'm keeping __app_id here as it's used for the Firestore path
import React, { useEffect, useState } from 'react';
// because Firebase should only be initialized once in the entire application (e.g., in ../firebase.js).
import { onAuthStateChanged } from 'firebase/auth'; // Only need onAuthStateChanged from auth
import { collection, onSnapshot } from 'firebase/firestore'; // Only need collection and onSnapshot from firestore
import Sidebar from '../dashboard/components/sidebar';
import { db, auth } from '../firebase'; // This is where Firebase is initialized once, and we import it here


// Global variable for the Canvas environment's app ID, used for Firestore paths
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Leaderboard component
const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Effect for Firebase authentication and setting up auth state listener
  // Now using the 'auth' instance imported from '../firebase'
  useEffect(() => {
    // No need to call signInAnonymously or signInWithCustomToken here.
    // The main Firebase setup (e.g., in App.js or a top-level component)
    // should handle initial authentication if needed.
    // This useEffect will just listen for auth state changes.

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        console.log("User authenticated:", user.uid);
      } else {
        setUserId(null);
        setIsAuthReady(true); // Still set to true even if no user, means auth check is done
        console.log("No user authenticated or authentication pending.");
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]); // Depend on 'auth' instance

  // Effect for fetching leaderboard data once authentication is ready
  useEffect(() => {
    if (!isAuthReady) {
      return; // Wait until authentication state is determined
    }

    setLoading(true);
    setError(null);

    // Define the collection path for public user profiles
    const userProfilesCollectionRef = collection(db, `artifacts/${appId}/public/data/userProfiles`);

    // Set up a real-time listener for user profiles
    const unsubscribe = onSnapshot(userProfilesCollectionRef, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          displayName: data.displayName || 'Anonymous User',
          pnlPercentage: data.pnlPercentage !== undefined ? data.pnlPercentage : 0,
          // Add other relevant fields if needed, e.g., lastUpdated: data.lastUpdated
        });
      });

      // Sort users by PnL percentage in descending order
      users.sort((a, b) => b.pnlPercentage - a.pnlPercentage);
      setLeaderboardData(users);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching leaderboard data:", err);
      setError("Failed to load leaderboard data.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, db, appId]); // Depend on 'isAuthReady', 'db', and 'appId'

  return (
    // Uses the .dashboard-layout class from your sidebar.css
    <div className="dashboard-layout">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          body { margin: 0; padding: 0; overflow: hidden; } /* Ensure no extra body margin for full height */
        `}
      </style>

      {/* Render the Sidebar component */}
      <Sidebar />

      {/* Main content area - properly centered within flex layout */}
      <main style={{
        flexGrow: 1,
        overflow: 'auto',
        backgroundColor: '#111827',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '2rem 1rem'
      }}>
        {/* The leaderboard card - now properly centered */}
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6">
            <h1 className="text-4xl font-bold text-center text-blue-400 mb-8 tracking-wide">
              <span className="inline-block mr-2">🏆</span> Leaderboard <span className="inline-block ml-2">🏆</span>
            </h1>

            {loading && (
              <div className="text-center text-blue-300 text-lg">Loading leaderboard...</div>
            )}

            {error && (
              <div className="text-center text-red-400 text-lg p-4 bg-red-900 rounded-lg">
                Error: {error}
              </div>
            )}

            {userId && (
              <div className="text-center text-sm text-gray-400 mb-4">
                Your User ID: <span className="font-mono text-blue-300">{userId}</span>
              </div>
            )}

            {!loading && !error && leaderboardData.length === 0 && (
              <div className="text-center text-gray-400 text-lg">No data available. Start trading to see results!</div>
            )}

            {!loading && !error && leaderboardData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-blue-600 text-white uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left rounded-tl-lg">Rank</th>
                      <th className="py-3 px-6 text-left">Player Name</th>
                      <th className="py-3 px-6 text-right rounded-tr-lg">PnL %</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-200 text-sm font-light">
                    {leaderboardData.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-gray-600 hover:bg-gray-600 transition-colors duration-200
                          ${index === 0 ? 'bg-yellow-700 bg-opacity-30' : ''}
                          ${index === 1 ? 'bg-gray-500 bg-opacity-30' : ''}
                          ${index === 2 ? 'bg-orange-700 bg-opacity-30' : ''}
                        `}
                      >
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="font-medium text-lg mr-2">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                              {index >= 3 && `${index + 1}`}
                            </span>
                          </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <span className="font-medium">{user.displayName}</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <span className={`font-bold text-lg ${user.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {user.pnlPercentage.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;





