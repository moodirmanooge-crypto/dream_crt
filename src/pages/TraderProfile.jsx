import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { db, auth } from "../firebase/config";

import {
  useParams,
} from "react-router-dom";

import {
  FaHeart,
  FaUserFriends,
  FaCheckCircle,
} from "react-icons/fa";

export default function TraderProfile() {

  const { uid } = useParams();

  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {

    const currentUid =
      uid || auth.currentUser?.uid;

    if (!currentUid) return;

    const q = query(
      collection(db, "posts"),
      where("uid", "==", String(currentUid))
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setPosts(data);

      if (data.length > 0) {
        setProfile(data[0]);
      }

    });

    return () => unsub();

  }, [uid]);

  const totalLikes = posts.reduce(
    (acc, post) =>
      acc + (post.likes?.length || 0),
    0
  );

  const totalFollowers =
    profile?.followers?.length || 0;

  return (

    <div
      className="min-h-screen px-4 py-8"
      style={{
        background: "#020617",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >

      <div
        className="rounded-3xl p-6 mb-8"
        style={{
          background:
            "linear-gradient(145deg,#111827,#0f172a)",
          border:
            "1px solid rgba(245,197,24,0.2)",
        }}
      >

        <div className="flex items-center gap-4">

          {profile?.profileImage ? (

            <img
              src={profile.profileImage}
              alt=""
              className="w-24 h-24 rounded-full object-cover"
              style={{
                border:
                  "3px solid #F5C518",
              }}
            />

          ) : (

            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black"
              style={{
                background: "#F5C518",
                color: "#000",
              }}
            >

              {profile?.userName?.[0] || "T"}

            </div>

          )}

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-3xl font-black text-white">

                {profile?.userName || "Trader"}

              </h1>

              <FaCheckCircle
                className="text-blue-500"
              />

            </div>

            <p className="text-yellow-400 mt-1">

              Professional Trader

            </p>

          </div>

        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background:
                "rgba(255,255,255,0.03)",
            }}
          >

            <h1 className="text-2xl font-black text-yellow-400">

              {posts.length}

            </h1>

            <p className="text-gray-400 text-sm">

              Posts

            </p>

          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background:
                "rgba(255,255,255,0.03)",
            }}
          >

            <h1 className="text-2xl font-black text-red-500 flex items-center justify-center gap-2">

              <FaHeart />

              {totalLikes}

            </h1>

            <p className="text-gray-400 text-sm">

              Likes

            </p>

          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background:
                "rgba(255,255,255,0.03)",
            }}
          >

            <h1 className="text-2xl font-black text-cyan-400 flex items-center justify-center gap-2">

              <FaUserFriends />

              {totalFollowers}

            </h1>

            <p className="text-gray-400 text-sm">

              Followers

            </p>

          </div>

        </div>

      </div>

      <div className="space-y-6">

        {posts.length === 0 ? (

          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background:
                "linear-gradient(145deg,#141414,#0f0f0f)",
              border:
                "1px solid rgba(245,197,24,0.18)",
            }}
          >

            <h1 className="text-2xl font-black text-yellow-400 mb-2">

              No Posts Yet

            </h1>

            <p className="text-gray-500">

              Trader-kan wali wax post ma uusan sameyn

            </p>

          </div>

        ) : (

          posts.map((post) => (

            <div
              key={post.id}
              className="rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg,#141414,#0f0f0f)",
                border:
                  "1px solid rgba(245,197,24,0.18)",
              }}
            >

              {post.mediaURL &&
                post.mediaType ===
                  "image" && (

                  <img
                    src={post.mediaURL}
                    alt=""
                    className="w-full object-cover"
                    style={{
                      maxHeight: "400px",
                    }}
                  />

                )}

              {post.mediaURL &&
                post.mediaType ===
                  "video" && (

                  <video
                    src={post.mediaURL}
                    controls
                    className="w-full"
                    style={{
                      maxHeight: "400px",
                    }}
                  />

                )}

              <div className="p-5">

                <p className="text-white">

                  {post.caption}

                </p>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

}