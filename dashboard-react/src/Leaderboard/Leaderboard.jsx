// React hooks for state and lifecycle
import React, { useState, useEffect, useCallback } from 'react';

// Firebase authentication and callable functions
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../firebase'; // Your configured Firebase instance

// Initialize Firebase Functions instance
const functions = getFunctions();

// Reference to the backend Cloud Function `getFriendLeaderboard`
const getFriendLeaderboardCallable = httpsCallable(functions, 'getFriendLeaderboard');

function Leaderboard() {
    // State variables
    const [leaderboardData, setLeaderboardData] = useState([]); // Stores leaderboard entries
    const [loading, setLoading] = useState(true);                // Tracks loading state
    const [error, setError] = useState(null);                    // Stores any error messages
    const [timeframe, setTimeframe] = useState('all_time');      // Selected timeframe for leaderboard
    const [currentUserId, setCurrentUserId] = useState(null);    // Stores logged-in user's ID

    // Handle Firebase authentication and store current user's ID
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid); // Save user ID if logged in
            } else {
                setCurrentUserId(null); // Clear user ID if logged out
                alert("Please log in to view the leaderboard."); // Prompt login
                setLoading(false);
            }
        });
        return () => unsubscribeAuth(); // Cleanup listener on unmount
    }, []);

    // Fetch leaderboard data from Firebase Function
    const fetchLeaderboard = useCallback(async () => {
        if (!currentUserId) {
            setError("User not authenticated.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await getFriendLeaderboardCallable({ timeframe }); // Pass selected timeframe
            if (result.data.success) {
                setLeaderboardData(result.data.leaderboard); // Update leaderboard state
            } else {
                // Handle unsuccessful response
                const msg = result.data.message || "Failed to fetch leaderboard.";
                setError(msg);
                alert(msg);
            }
        } catch (err) {
            // Handle function call error
            console.error("Error calling getFriendLeaderboard:", err);
            setError(`Error fetching leaderboard: ${err.message}`);
            alert(`Error fetching leaderboard: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, timeframe]);

    // Re-fetch leaderboard when user or timeframe changes
    useEffect(() => {
        if (currentUserId) {
            fetchLeaderboard();
        }
    }, [currentUserId, timeframe, fetchLeaderboard]);

    // Handle timeframe button clicks
    const handleTimeframeChange = (newTimeframe) => {
        setTimeframe(newTimeframe);
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white font-inter rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Friend Leaderboard</h2>

            {/* Timeframe selection buttons */}
            <div className="flex justify-center mb-6 space-x-4 flex-wrap">
                <button
                    onClick={() => handleTimeframeChange('all_time')}
                    className={`px-5 py-2 rounded-md font-semibold transition duration-300 ease-in-out ${
                        timeframe === 'all_time' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    All Time
                </button>
                <button
                    onClick={() => handleTimeframeChange('yearly')}
                    className={`px-5 py-2 rounded-md font-semibold transition duration-300 ease-in-out ${
                        timeframe === 'yearly' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    This Year
                </button>
                <button
                    onClick={() => handleTimeframeChange('monthly')}
                    className={`px-5 py-2 rounded-md font-semibold transition duration-300 ease-in-out ${
                        timeframe === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Last 30 Days
                </button>
                <button
                    onClick={() => handleTimeframeChange('weekly')}
                    className={`px-5 py-2 rounded-md font-semibold transition duration-300 ease-in-out ${
                        timeframe === 'weekly' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Last 7 Days
                </button>
            </div>

            {/* Display loading message */}
            {loading && (
                <div className="text-center text-blue-400 text-lg">Loading leaderboard...</div>
            )}

            {/* Display error message */}
            {error && (
                <div className="text-center text-red-500 text-lg">{error}</div>
            )}

            {/* No data fallback message */}
            {!loading && !error && leaderboardData.length === 0 && (
                <div className="text-center text-gray-400 text-lg">
                    No leaderboard data available. Start trading or add friends!
                </div>
            )}

            {/* Display leaderboard table */}
            {!loading && !error && leaderboardData.length > 0 && (
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-gray-800 rounded-lg">
                        <thead>
                            <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Rank</th>
                                <th className="py-3 px-6 text-left">Trader</th>
                                <th className="py-3 px-6 text-right">PnL %</th>
                                <th className="py-3 px-6 text-right">Realized PnL</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-200 text-sm font-light">
                            {leaderboardData.map((entry, index) => (
                                <tr key={entry.userId} className="border-b border-gray-700 hover:bg-gray-700 transition duration-200 ease-in-out">
                                    {/* Display rank */}
                                    <td className="py-3 px-6 text-left whitespace-nowrap">
                                        <span className="font-bold text-blue-300">{index + 1}</span>
                                    </td>
                                    {/* Display trader name and "(You)" if it's the logged-in user */}
                                    <td className="py-3 px-6 text-left">
                                        {entry.displayName} {entry.userId === currentUserId && "(You)"}
                                    </td>
                                    {/* Display PnL % with green/red color based on performance */}
                                    <td className="py-3 px-6 text-right">
                                        <span className={`${entry.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                                            {entry.pnlPercentage.toFixed(2)}%
                                        </span>
                                    </td>
                                    {/* Display realized PnL value */}
                                    <td className="py-3 px-6 text-right">
                                        <span className={`${entry.totalRealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${entry.totalRealizedPnL.toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
