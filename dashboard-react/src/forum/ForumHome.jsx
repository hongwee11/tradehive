import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase"; 
import { collection, getDocs } from "firebase/firestore";
import './forum.css';


function ForumHome() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const snapshot = await getDocs(collection(db, "posts"));
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPosts();
  }, []);

  return (
    <div className="forum-home">
      <h2>Trade Ideas Forum</h2>
      <Link to="/forum/create">Create a Post</Link>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/forum/post/${post.id}`}>
              {post.title} - {post.author}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ForumHome;
