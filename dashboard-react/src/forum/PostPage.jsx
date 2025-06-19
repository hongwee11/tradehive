// React Router hook to access route parameters (e.g., post ID)
import { useParams } from "react-router-dom";

// Firestore functions for retrieving and adding data
import { doc, getDoc, collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";

// Firebase configuration (database and authentication)
import { db, auth } from "../firebase";

// React hooks for state and effect
import { useEffect, useState } from "react";

// Component to display a single post and its comments
function PostPage() {
  const { id } = useParams(); // Get post ID from the URL
  const [post, setPost] = useState(null); // State to hold the post data
  const [comments, setComments] = useState([]); // State to hold all comments
  const [comment, setComment] = useState(""); // State to hold the input for new comment

  // Fetch post and its comments when the component loads or when post ID changes
  useEffect(() => {
    const fetchPostAndComments = async () => {
      // Fetch post document by ID
      const postDoc = await getDoc(doc(db, "posts", id));
      setPost(postDoc.data()); // Store post data in state

      // Query Firestore for comments that belong to this post
      const q = query(collection(db, "comments"), where("postId", "==", id));
      const commentSnapshot = await getDocs(q);

      // Store comment data in state
      setComments(commentSnapshot.docs.map(doc => doc.data()));
    };

    fetchPostAndComments();
  }, [id]); // Re-run if post ID changes

  // Handle submitting a new comment
  const handleComment = async (e) => {
    e.preventDefault(); // Prevent form reload
    const user = auth.currentUser; // Get the current user

    // Add new comment document to Firestore
    await addDoc(collection(db, "comments"), {
      postId: id,                 // Associate comment with the post
      content: comment,           // Comment text
      userId: user.uid,           // User ID of commenter
      userEmail: user.email,      // User email of commenter
      createdAt: Timestamp.now(), // Timestamp for when comment was made
    });

    // Update local comment state to show it immediately
    setComments([...comments, {
      content: comment,
      userEmail: user.email,
    }]);

    // Clear the comment input box
    setComment("");
  };

  // Component UI
  return (
    <div>
      {/* Render post if it has been loaded */}
      {post && (
        <>
          <h2>{post.title}</h2> {/* Post title */}
          <p>{post.content}</p> {/* Post content */}
          <small>Posted by: {post.userEmail}</small> {/* Author info */}
        </>
      )}

      <hr />

      {/* Comments Section */}
      <h3>Comments</h3>
      <ul>
        {comments.map((c, i) => (
          <li key={i}>
            {c.content} — <i>{c.userEmail}</i> {/* Comment content and user */}
          </li>
        ))}
      </ul>

      {/* Form to submit new comment */}
      <form onSubmit={handleComment}>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)} // Update comment state as user types
          placeholder="Write a comment..."
          required
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}

// Export the component so it can be used in routes
export default PostPage;

