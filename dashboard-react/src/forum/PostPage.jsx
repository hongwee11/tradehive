import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useEffect, useState } from "react";

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchPostAndComments = async () => {
      const postDoc = await getDoc(doc(db, "posts", id));
      setPost(postDoc.data());

      const q = query(collection(db, "comments"), where("postId", "==", id));
      const commentSnapshot = await getDocs(q);
      setComments(commentSnapshot.docs.map(doc => doc.data()));
    };

    fetchPostAndComments();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    await addDoc(collection(db, "comments"), {
      postId: id,
      content: comment,
      userId: user.uid,
      userEmail: user.email,
      createdAt: Timestamp.now(),
    });

    setComments([...comments, {
      content: comment,
      userEmail: user.email,
    }]);

    setComment("");
  };

  return (
    <div>
      {post && (
        <>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <small>Posted by: {post.userEmail}</small>
        </>
      )}
      <hr />
      <h3>Comments</h3>
      <ul>
        {comments.map((c, i) => (
          <li key={i}>
            {c.content} — <i>{c.userEmail}</i>
          </li>
        ))}
      </ul>
      <form onSubmit={handleComment}>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}

export default PostPage;
