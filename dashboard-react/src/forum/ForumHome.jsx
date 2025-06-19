// React hooks for state and lifecycle
import { useEffect, useState } from "react";

// React Router's Link for navigation between pages
import { Link } from "react-router-dom";

// Import Firestore database instance
import { db } from "../firebase";

// Firestore functions for reading data
import { collection, getDocs } from "firebase/firestore";

// Import custom CSS for forum styling
import './forum.css';

// ForumHome component displays the list of all forum posts
function ForumHome() {
  // React state to store an array of post objects
  const [posts, setPosts] = useState([]);

  // useEffect hook runs once when the component mounts
  useEffect(() => {
    // Async function to fetch all posts from Firestore
    const fetchPosts = async () => {
      // Get all documents from "posts" collection
      const snapshot = await getDocs(collection(db, "posts"));

      // Convert snapshot into array of post objects with ID included
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    // Call the fetch function
    fetchPosts();
  }, []); // Empty dependency array = run only on first render

  // Component UI
  return (
    <div className="forum-container-wrapper"> {/* Wrapper for the whole page layout */}

      {/* Top button that navigates back to dashboard/home */}
      <div className="back-to-home-button-container">
        <Link className="home-button" to="/dashboard">
          Back to Home
        </Link>
      </div>

      {/* Main forum area */}
      <div className="forum-home">
        
        {/* Header section of the forum page */}
        <div className="forum-header">
          <h2>Trade Ideas Forum</h2> {/* Forum title */}

          {/* Button to navigate to the CreatePost page */}
          <Link className="create-post-button" to="/forum/create">
            + Create a Post
          </Link>
        </div>

        {/* List of posts */}
        <ul className="post-list">
          {posts.map(post => (
            <li className="post-item" key={post.id}> {/* Each post list item */}
              <Link to={`/forum/post/${post.id}`}> {/* Link to the post detail page */}
                <div className="post-title">{post.title}</div> {/* Post title */}
                <div className="post-author">by {post.author || "Anonymous"}</div> {/* Author name */}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Export component to be used in other parts of the app
export default ForumHome;
