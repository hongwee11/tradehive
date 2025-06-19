// Import React hook for state management
import { useState } from "react";

// Import Firebase database and auth utilities
import { db, auth } from "../firebase";

// Import Firestore methods
import { collection, addDoc, Timestamp } from "firebase/firestore";

// Import navigation helpers from React Router
import { useNavigate, Link } from "react-router-dom";

// Import styling
import './forum.css';

// Component for creating a new forum post
function CreatePost() {
  // React state for post title
  const [title, setTitle] = useState("");

  // React state for post content
  const [content, setContent] = useState("");

  // React Router hook to navigate to another route
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Basic validation: ensure title and content are not empty
    if (!title.trim() || !content.trim()) {
      console.error("Please fill in both title and content.");
      alert("Please fill in both title and content.");
      return;
    }

    try {
      // Get currently logged-in user
      const user = auth.currentUser;

      // Use user's email as the post author, or "Anonymous" if not logged in
      const authorEmail = user ? user.email : "Anonymous";

      // Add a new post document to the "posts" collection in Firestore
      await addDoc(collection(db, "posts"), {
        title,                     // Post title
        content,                   // Post content
        author: authorEmail,       // Post author
        createdAt: Timestamp.now(),// Timestamp for when the post was created
        votes: 0,                  // Initialize vote count to 0
      });

      // Redirect user to the forum page after posting
      navigate("/forum");
    } catch (error) {
      // Handle any errors during post creation
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  // Component UI
  return (
    <div className="create-post-page-container">
      {/* Back button that links to the forum homepage */}
      <div className="back-to-home-button-container">
        <Link className="home-button" to="/forum">
          Back to Forum
        </Link>
      </div>

      {/* Card container for the form */}
      <div className="create-post-card">
        <h2 className="create-post-title">Create a New Post</h2>

        {/* Post creation form */}
        <form onSubmit={handleSubmit} className="create-post-form">
          
          {/* Title input field */}
          <div className="form-group">
            <label htmlFor="postTitle" className="form-label">Post Title</label>
            <input
              type="text"
              id="postTitle"
              className="form-input"
              placeholder="Your insightful title here"
              value={title}
              onChange={(e) => setTitle(e.target.value)} // Update title state on input
              required
            />
          </div>

          {/* Content textarea field */}
          <div className="form-group">
            <label htmlFor="postContent" className="form-label">Trade Idea</label>
            <textarea
              id="postContent"
              className="form-textarea"
              placeholder="Share your detailed trade idea, analysis, and reasoning..."
              value={content}
              onChange={(e) => setContent(e.target.value)} // Update content state on input
              rows="10"
              required
            ></textarea>
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-post-button">
            Submit Post
          </button>
        </form>
      </div>
    </div>
  );
}

// Export the component so it can be used in other parts of the app
export default CreatePost;
