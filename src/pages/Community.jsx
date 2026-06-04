import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";

import { FaCheckCircle } from "react-icons/fa";

import { db, auth } from "../firebase/config";

import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import {
  FaHeart,
  FaRegHeart,
  FaUserPlus,
  FaUserCheck,
  FaShare,
  FaWhatsapp,
  FaTelegram,
  FaLink,
  FaComment,
  FaTimes,
  FaEllipsisV,
  FaFilter,
} from "react-icons/fa";



// ───────────────── SHARE MODAL ─────────────────

function ShareModal({ post, onClose }) {

  const shareUrl = `${window.location.origin}/post/${post.id}`;

  const text = encodeURIComponent(
    post.caption || "Check out this post!"
  );

  const url = encodeURIComponent(shareUrl);

  const options = [

    {
      label: "WhatsApp",
      icon: <FaWhatsapp size={22} />,
      color: "#25D366",
      href: `https://wa.me/?text=${text}%20${url}`,
    },

    {
      label: "Telegram",
      icon: <FaTelegram size={22} />,
      color: "#229ED9",
      href: `https://t.me/share/url?url=${url}&text=${text}`,
    },

    {
      label: "Copy Link",
      icon: <FaLink size={22} />,
      color: "#F5C518",

      action: () => {

        navigator.clipboard.writeText(shareUrl);

        alert("Link copied!");

        onClose();

      },
    },

  ];

  return (

    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >

      <div
        className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
        style={{
          background: "#111",
          border: "1px solid rgba(245,197,24,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-black text-yellow-400">
            Share Post
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >

            <FaTimes size={20} />

          </button>

        </div>

        <div className="flex gap-4 justify-around">

          {options.map((opt) =>

            opt.href ? (

              <a
                key={opt.label}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: opt.color + "22",
                    border: `1px solid ${opt.color}55`,
                  }}
                >

                  <span style={{ color: opt.color }}>
                    {opt.icon}
                  </span>

                </div>

                <span className="text-sm text-gray-300">
                  {opt.label}
                </span>

              </a>

            ) : (

              <button
                key={opt.label}
                onClick={opt.action}
                className="flex flex-col items-center gap-2"
              >

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: opt.color + "22",
                    border: `1px solid ${opt.color}55`,
                  }}
                >

                  <span style={{ color: opt.color }}>
                    {opt.icon}
                  </span>

                </div>

                <span className="text-sm text-gray-300">
                  {opt.label}
                </span>

              </button>

            )

          )}

        </div>

      </div>

    </div>

  );

}



// ───────────────── COMMENTS ─────────────────

function CommentsSection({ postId, currentUser }) {

  const [comments, setComments] = useState([]);

  const [text, setText] = useState("");

  useEffect(() => {

    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {

      setComments(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

    });

    return () => unsub();

  }, [postId]);

  const submitComment = async () => {

    if (!text.trim() || !currentUser) return;

    await addDoc(
      collection(db, "posts", postId, "comments"),
      {
        userName:
          currentUser.displayName || "Trader",

        userPhoto:
          currentUser.photoURL || null,

        text: text.trim(),

        createdAt: Date.now(),

        userId: currentUser.uid,
      }
    );

    setText("");

  };

  return (

    <div
      className="pt-4 mt-2"
      style={{
        borderTop:
          "1px solid rgba(245,197,24,0.1)",
      }}
    >

      <div className="flex gap-3 items-center mb-5 px-4">

        <div
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold"
          style={{
            background:
              "rgba(245,197,24,0.2)",
            color: "#F5C518",
          }}
        >

          {currentUser?.photoURL ? (

            <img
              src={currentUser.photoURL}
              alt=""
              className="w-full h-full object-cover"
            />

          ) : (

            currentUser?.displayName?.[0]?.toUpperCase() || "U"

          )}

        </div>

        <div className="flex-1 flex gap-2">

          <input
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder="Write comment..."
            className="flex-1 text-sm px-4 py-2 rounded-full outline-none text-white"
            style={{
              background:
                "rgba(255,255,255,0.06)",
              border:
                "1px solid rgba(245,197,24,0.15)",
            }}
          />

          <button
            onClick={submitComment}
            className="px-4 py-2 rounded-full text-sm font-bold"
            style={{
              background: "#F5C518",
              color: "#000",
            }}
          >

            Post

          </button>

        </div>

      </div>

      <div className="space-y-3 px-4 pb-4">

        {comments.map((c) => (

          <div
            key={c.id}
            className="flex gap-3 items-start"
          >

            <div
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold"
              style={{
                background:
                  "rgba(245,197,24,0.2)",
                color: "#F5C518",
              }}
            >

              {c.userPhoto ? (

                <img
                  src={c.userPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />

              ) : (

                c.userName?.[0]?.toUpperCase()

              )}

            </div>

            <div
              className="px-4 py-2 rounded-2xl text-sm"
              style={{
                background:
                  "rgba(255,255,255,0.05)",
              }}
            >

              <span className="font-bold text-yellow-400 mr-2">
                {c.userName}
              </span>

              <span className="text-gray-200">
                {c.text}
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}



// ───────────────── POST CARD ─────────────────

function PostCard({ post, currentUser }) {

  const navigate = useNavigate();

  const [showComments, setShowComments] =
    useState(false);

  const [shareModal, setShareModal] =
    useState(false);

  const [localPost, setLocalPost] =
    useState({
      ...post,
      likes: Array.isArray(post.likes)
        ? post.likes
        : [],
      followers: Array.isArray(post.followers)
        ? post.followers
        : [],
    });

  const isLiked =
    localPost.likes.includes(currentUser?.uid);

  const isFollowing =
    localPost.followers.includes(currentUser?.uid);

  const likePost = async () => {

    if (!currentUser) return;

    const postRef = doc(
      db,
      "posts",
      localPost.id
    );

    if (isLiked) {

      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid),
      });

      setLocalPost((p) => ({
        ...p,
        likes: p.likes.filter(
          (id) => id !== currentUser.uid
        ),
      }));

    } else {

      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid),
      });

      setLocalPost((p) => ({
        ...p,
        likes: [...p.likes, currentUser.uid],
      }));

    }

  };

  const followTrader = async () => {

    if (!currentUser) return;

    if (isFollowing) return;

    const postRef = doc(
      db,
      "posts",
      localPost.id
    );

    await updateDoc(postRef, {
      followers: arrayUnion(currentUser.uid),
    });

    setLocalPost((p) => ({
      ...p,
      followers: [
        ...p.followers,
        currentUser.uid,
      ],
    }));

  };

  return (

    <>

      {shareModal && (

        <ShareModal
          post={localPost}
          onClose={() =>
            setShareModal(false)
          }
        />

      )}

      <article
        className="rounded-3xl overflow-hidden hover:scale-[1.01]"
        style={{
          background:
            "linear-gradient(145deg,#141414 0%,#0f0f0f 100%)",

          border:
            "1px solid rgba(245,197,24,0.18)",
            transition: "0.3s",
        }}
      >

        <div className="flex items-center justify-between px-5 py-4">

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              navigate(`/trader/${localPost.uid}`)
            }
          >

            {localPost.profileImage ? (

              <img
                src={localPost.profileImage}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
                style={{
                  border:
                    "2px solid #F5C518",
                }}
              />

            ) : (

              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black"
                style={{
                  background: "#F5C518",
                  color: "#000",
                }}
              >

                {localPost.userName?.[0]?.toUpperCase()}

              </div>

            )}

            <div>

              <h1 className="font-black text-white text-lg">
                <div className="flex items-center gap-2">

                  <span>
                    {localPost.userName}
                  </span>

                  <FaCheckCircle
                    className="text-blue-500"
                    size={14}
                  />

                </div>
              </h1>

              <div className="flex items-center gap-3 mt-1">
                <p className="text-[11px] text-gray-500 mt-1">

                  {new Date(localPost.createdAt).toLocaleDateString()}

                </p>
                <p className="text-xs text-yellow-400">
                  Professional Trader
                </p>

                <p className="text-xs text-gray-500">
                  {(localPost.followers || []).length} Followers
                </p>

              </div>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={followTrader}
              className="px-4 py-2 rounded-xl font-bold text-sm"
              style={
                isFollowing
                  ? {
                      background:
                        "rgba(245,197,24,0.1)",
                      color: "#F5C518",
                    }
                  : {
                      background: "#F5C518",
                      color: "#000",
                    }
              }
            >

              {isFollowing ? (
                <FaUserCheck />
              ) : (
                <FaUserPlus />
              )}

            </button>

            <button
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{
                background:
                  "rgba(255,255,255,0.05)",
              }}
            >

              <FaEllipsisV size={13} />

            </button>

          </div>

        </div>

        {localPost.mediaURL &&
          localPost.mediaType ===
            "image" && (

            <div className="px-4">

              <img
                src={localPost.mediaURL}
                alt=""
                className="w-full rounded-2xl object-cover"
                style={{
                  height: "420px",
                  objectFit: "cover",
                }}
              />

            </div>

          )}

        {localPost.mediaURL &&
          localPost.mediaType ===
            "video" && (

            <div className="px-4">

              <video
                src={localPost.mediaURL}
                controls
                className="w-full rounded-2xl object-cover"
                style={{
                  maxHeight: "420px",
                }}
              />

            </div>

          )}

        <div className="px-5 pt-4 pb-3">

          <p className="text-gray-300 text-sm leading-relaxed">
            {localPost.caption}
          </p>

        </div>

        <div
          className="flex items-center px-5 py-3"
          style={{
            borderTop:
              "1px solid rgba(245,197,24,0.08)",
          }}
        >

          <button
            onClick={likePost}
            className="flex items-center gap-2 flex-1 justify-center"
            style={{
              color: isLiked
                ? "#ef4444"
                : "#999",
            }}
          >

            {isLiked ? (
              <FaHeart />
            ) : (
              <FaRegHeart />
            )}

            {localPost.likes.length}

          </button>

          <button
            onClick={() =>
              setShowComments(
                !showComments
              )
            }
            className="flex items-center gap-2 flex-1 justify-center text-gray-400"
          >

            <FaComment />

            <span>
              {localPost.commentCount || 0}
            </span>

          </button>

          <button
            onClick={() =>
              setShareModal(true)
            }
            className="flex items-center gap-2 flex-1 justify-center text-gray-400"
          >

            <FaShare />

            <span>
              {localPost.shareCount || 0}
            </span>

          </button>

        </div>

        {showComments && (

          <CommentsSection
            postId={localPost.id}
            currentUser={currentUser}
          />

        )}

      </article>

    </>

  );

}



// ───────────────── MAIN PAGE ─────────────────

export default function Community() {

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  useEffect(() => {

    const unsubAuth =
      onAuthStateChanged(auth, (user) => {

        setCurrentUser(user);

        setAuthLoading(false);

      });

    return () => unsubAuth();

  }, []);

  useEffect(() => {

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {

        const data = snap.docs.map((d) => {

          const item = d.data();

          return {

            id: d.id,

            ...item,

            likes: Array.isArray(item.likes)
              ? item.likes
              : [],

            followers: Array.isArray(item.followers)
              ? item.followers
              : [],

          };

        });

        setPosts(data);

        setLoading(false);

      },

      (error) => {

        console.log(error);

        setLoading(false);

      }

    );

    return () => unsub();

  }, []);

  if (authLoading) {

    return (

      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "#0a0a0a",
        }}
      >

        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{
            borderColor: "#F5C518",
            borderTopColor:
              "transparent",
          }}
        />

      </div>

    );

  }

  return (

    <div
      className="min-h-screen px-4 py-8 pb-24"
      style={{
        background: "#0a0a0a",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >

      <div className="flex items-start justify-between mb-8">

        <div>

          <h1 className="text-4xl font-black text-yellow-400">
            Community Feed
          </h1>

          <p className="text-gray-500 text-sm mt-1 tracking-widest uppercase">
            Trade · Learn · Connect
          </p>

        </div>

        <button
          className="w-11 h-11 rounded-full flex items-center justify-center mt-1"
          style={{
            background:
              "rgba(245,197,24,0.1)",

            border:
              "1px solid rgba(245,197,24,0.25)",

            color: "#F5C518",
          }}
        >

          <FaFilter size={15} />

        </button>

      </div>

      {loading ? (

        <div className="flex justify-center py-20">

          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: "#F5C518",
              borderTopColor:
                "transparent",
            }}
          />

        </div>

      ) : posts.length === 0 ? (

        <div className="text-center py-20 text-gray-600">
          No posts yet.
        </div>

      ) : (

        <div className="space-y-6">

          {posts.map((post) => (

            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
            />

          ))}

        </div>

      )}

    </div>

  );

}