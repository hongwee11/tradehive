// React and Firebase imports
import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc, getDoc, setDoc, deleteDoc,
  collection, query, where, getDocs,
  writeBatch, onSnapshot, Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase'; // Firebase config and instances

function FriendManagement() {
    // UI and data states
    const [searchTerm, setSearchTerm] = useState(''); // For user search input
    const [searchResults, setSearchResults] = useState([]); // Stores search results
    const [incomingRequests, setIncomingRequests] = useState([]); // Stores incoming friend requests
    const [friendsList, setFriendsList] = useState([]); // Stores current user's friends
    const [currentUserId, setCurrentUserId] = useState(null); // Authenticated user's ID

    // Auth listener - sets current user ID when logged in
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
                alert("Please log in to manage friends."); // Show alert if not logged in
            }
        });
        return () => unsubscribeAuth(); // Clean up listener on unmount
    }, []);

    // Real-time listeners for friend requests and friends list
    useEffect(() => {
        if (!currentUserId) return;

        // Listen to incoming friend requests collection
        const unsubscribeRequests = onSnapshot(
            collection(db, "users", currentUserId, "friendRequests"),
            (snapshot) => {
                const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setIncomingRequests(requests);
            },
            (error) => {
                console.error("Error fetching incoming requests:", error);
                alert("Error loading friend requests.");
            }
        );

        // Listen to friends collection
        const unsubscribeFriends = onSnapshot(
            collection(db, "users", currentUserId, "friends"),
            (snapshot) => {
                const friends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFriendsList(friends);
            },
            (error) => {
                console.error("Error fetching friends list:", error);
                alert("Error loading friends list.");
            }
        );

        // Cleanup both listeners on unmount
        return () => {
            unsubscribeRequests();
            unsubscribeFriends();
        };
    }, [currentUserId]);

    // Handle search for users by display name
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            // Query Firestore for users with matching displayName
            const usersQuery = query(collection(db, "users"), where("displayName", "==", searchTerm.trim()));
            const snapshot = await getDocs(usersQuery);
            const results = snapshot.docs
                .filter(doc => doc.id !== currentUserId) // Exclude self
                .map(doc => ({ id: doc.id, ...doc.data() }));

            if (results.length === 0) {
                alert(`No user found with display name "${searchTerm}".`);
            }
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching users:", error);
            alert("Error searching users.");
        }
    };

    // Send a friend request to another user
    const sendFriendRequest = useCallback(async (targetUserId, targetUserDisplayName) => {
        if (!currentUserId) {
            alert("You must be logged in to send a friend request.");
            return;
        }

        try {
            // Get current user document to retrieve display name
            const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
            if (!currentUserDoc.exists()) {
                alert("Your user profile not found.");
                return;
            }
            const currentUserDisplayName = currentUserDoc.data().displayName || "Unknown User";

            // Check if already friends
            const existingFriendship = await getDoc(doc(db, "users", currentUserId, "friends", targetUserId));
            if (existingFriendship.exists()) {
                alert(`You are already friends with ${targetUserDisplayName}.`);
                return;
            }

            // Check if a request has already been sent
            const existingRequestQuery = query(
                collection(db, "users", targetUserId, "friendRequests"),
                where("senderId", "==", currentUserId)
            );
            const existingRequests = await getDocs(existingRequestQuery);
            if (!existingRequests.empty) {
                alert(`Friend request already sent to ${targetUserDisplayName}.`);
                return;
            }

            // Send friend request to target user's collection
            await setDoc(doc(db, "users", targetUserId, "friendRequests", currentUserId), {
                senderId: currentUserId,
                senderDisplayName: currentUserDisplayName,
                status: "pending",
                timestamp: Timestamp.now(),
            });

            alert(`Friend request sent to ${targetUserDisplayName}.`);
            setSearchResults([]); // Clear results after sending
        } catch (error) {
            console.error("Error sending friend request:", error);
            alert("Failed to send friend request.");
        }
    }, [currentUserId]);

    // Accept a friend request and update both users' friend lists
    const acceptFriendRequest = useCallback(async (senderId, senderDisplayName) => {
        if (!currentUserId) {
            alert("You must be logged in to accept a friend request.");
            return;
        }

        const batch = writeBatch(db); // Batch write for atomic operations

        try {
            // 1. Delete friend request document
            const requestDocRef = doc(db, "users", currentUserId, "friendRequests", senderId);
            batch.delete(requestDocRef);

            // 2. Add sender to current user's friend list
            const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
            const currentUserDisplayName = currentUserDoc.data().displayName || "You";

            const friendOfCurrentUserRef = doc(db, "users", currentUserId, "friends", senderId);
            batch.set(friendOfCurrentUserRef, {
                friendId: senderId,
                friendDisplayName: senderDisplayName,
                timestamp: Timestamp.now(),
            });

            // 3. Add current user to sender's friend list
            const friendOfSenderRef = doc(db, "users", senderId, "friends", currentUserId);
            batch.set(friendOfSenderRef, {
                friendId: currentUserId,
                friendDisplayName: currentUserDisplayName,
                timestamp: Timestamp.now(),
            });

            // Commit all operations atomically
            await batch.commit();
            alert(`Friend request from ${senderDisplayName} accepted.`);
        } catch (error) {
            console.error("Error accepting friend request:", error);
            alert("Failed to accept friend request.");
        }
    }, [currentUserId]);

    // Decline a friend request by deleting it
    const declineFriendRequest = useCallback(async (senderId) => {
        if (!currentUserId) {
            alert("You must be logged in to decline a friend request.");
            return;
        }

        try {
            const requestDocRef = doc(db, "users", currentUserId, "friendRequests", senderId);
            await deleteDoc(requestDocRef);
            alert(`Friend request from ${senderId} declined.`);
        } catch (error) {
            console.error("Error declining friend request:", error);
            alert("Failed to decline friend request.");
        }
    }, [currentUserId]);

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white font-inter rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Friend Management</h2>

            {/* Search Section */}
            <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">Find New Friends</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search by display name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                    {/* Search button */}
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Search
                    </button>
                </div>

                {/* Display search results */}
                <div className="mt-4">
                    {searchResults.length > 0 ? (
                        <ul className="space-y-2">
                            {searchResults.map((user) => (
                                <li key={user.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                    <span>{user.displayName || user.id}</span>
                                    <button
                                        onClick={() => sendFriendRequest(user.id, user.displayName)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        Add Friend
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        searchTerm && <p className="text-gray-400 mt-2">No users found.</p>
                    )}
                </div>
            </div>

            {/* Incoming Friend Requests */}
            <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">
                    Incoming Requests ({incomingRequests.length})
                </h3>
                {incomingRequests.length > 0 ? (
                    <ul className="space-y-2">
                        {incomingRequests.map((request) => (
                            <li key={request.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-700 p-3 rounded-md">
                                <span className="mb-2 sm:mb-0">{request.senderDisplayName || request.senderId}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => acceptFriendRequest(request.senderId, request.senderDisplayName)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => declineFriendRequest(request.senderId)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No pending friend requests.</p>
                )}
            </div>

            {/* Friends List */}
            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">
                    Your Friends ({friendsList.length})
                </h3>
                {friendsList.length > 0 ? (
                    <ul className="space-y-2">
                        {friendsList.map((friend) => (
                            <li key={friend.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                <span>{friend.friendDisplayName || friend.id}</span>
                                {/* Optionally, you could add a 'Remove Friend' button here */}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">You don't have any friends yet. Find some!</p>
                )}
            </div>
        </div>
    );
}

export default FriendManagement;
