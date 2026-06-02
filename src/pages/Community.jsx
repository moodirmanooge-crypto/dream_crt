import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/config";

import { useAuth } from "../context/AuthContext";

import {
  FaHeart,
  FaComment,
  FaUserPlus,
  FaPaperPlane,
} from "react-icons/fa";

export default function Community() {

  const { currentUser, userData } = useAuth();

  const [posts, setPosts] = useState([]);

  const [content, setContent] = useState("");

  useEffect(() => {

    fetchPosts();

  }, []);

  const fetchPosts = async () => {

    const querySnapshot = await getDocs(
      collection(db, "posts")
    );

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPosts(data.reverse());

  };

  const createPost = async () => {

    if (!content) return;

    await addDoc(
      collection(db, "posts"),
      {

        userId: currentUser.uid,

        userName:
          userData?.name || "Trader",

        userEmail:
          currentUser.email,

        content,

        likes: 0,

        comments: 0,

        createdAt: Date.now(),

      }
    );

    setContent("");

    fetchPosts();

  };

  return (

    <div className="min-h-screen bg-black text-white">

      <div className="max-w-5xl mx-auto py-16 px-6">

        <h1 className="text-6xl font-black text-yellow-400 mb-12">

          Trading Community

        </h1>

        {/* CREATE POST */}

        <div className="bg-zinc-900 border border-yellow-500/20 p-8 rounded-3xl">

          <textarea
            placeholder="Share your trade idea..."
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            className="w-full h-40 bg-black rounded-2xl p-5 outline-none border border-yellow-500/20"
          />

          <button
            onClick={createPost}
            className="mt-6 bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black flex items-center gap-3"
          >

            <FaPaperPlane />

            Share Post

          </button>

        </div>

        {/* POSTS */}

        <div className="space-y-8 mt-10">

          {posts.map(post => (

            <div
              key={post.id}
              className="bg-zinc-900 border border-yellow-500/20 p-8 rounded-3xl"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h1 className="text-2xl font-black text-yellow-400">

                    {post.userName}

                  </h1>

                  <p className="text-slate-400">

                    {post.userEmail}

                  </p>

                </div>

                <button className="bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2">

                  <FaUserPlus />

                  Follow

                </button>

              </div>

              <p className="text-xl mt-8 leading-loose">

                {post.content}

              </p>

              <div className="flex items-center gap-10 mt-10">

                <button className="flex items-center gap-3 text-red-400 text-xl">

                  <FaHeart />

                  {post.likes}

                </button>

                <button className="flex items-center gap-3 text-cyan-400 text-xl">

                  <FaComment />

                  {post.comments}

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}