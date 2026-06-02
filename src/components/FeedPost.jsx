export default function FeedPost({ post }) {

  return (

    <div className="bg-zinc-900 p-8 rounded-3xl border border-yellow-500/20">

      <h1 className="text-2xl font-black text-yellow-400">

        {post.userName}

      </h1>

      <p className="text-slate-400 mt-2">

        {post.userEmail}

      </p>

      <p className="mt-8 text-xl">

        {post.content}

      </p>

    </div>

  );

}