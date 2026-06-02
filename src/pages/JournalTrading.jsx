import { useEffect, useState, useRef, useCallback } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import {
  FaChartLine,
  FaHistory,
  FaBrain,
  FaChartPie,
  FaCog,
  FaSearch,
  FaBell,
  FaPlus,
  FaSave,
  FaCamera,
  FaRocket,
  FaImage,
  FaVideo,
  FaChartBar,
  FaPaperPlane,
  FaTimes,
  FaUpload,
  FaTrophy,
  FaFire,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

const CURRENCY_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD",
  "GBPJPY","EURJPY","EURGBP","XAUUSD","XAGUSD","US30","NAS100","SPX500",
  "BTCUSD","ETHUSD",
];

// ─── NEW TRADE MODAL ──────────────────────────────────────────────────────────
function NewTradeModal({ onClose, onSave, profileData }) {
  const [step, setStep] = useState(1); // 1: trade details, 2: psychology
  const [tradeData, setTradeData] = useState({
    pair: "XAUUSD",
    direction: "BUY",
    entryPrice: "",
    stopLoss: "",
    takeProfit: "",
    lotSize: "",
    status: "Open",
    pips: "",
    profit_loss: "",
    notes_psychology: "",
    emotion: "",
    strategy: "",
  });
  const [setupImage, setSetupImage] = useState(null);
  const [setupImagePreview, setSetupImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);

  // Live RRR calculation
  const calcRRR = () => {
    const entry = parseFloat(tradeData.entryPrice);
    const sl = parseFloat(tradeData.stopLoss);
    const tp = parseFloat(tradeData.takeProfit);
    if (!entry || !sl || !tp) return null;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    if (risk === 0) return null;
    return (reward / risk).toFixed(2);
  };

  const rrr = calcRRR();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSetupImage(file);
    setSetupImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) { alert("Please Login"); return; }
    if (!tradeData.pair || !tradeData.entryPrice) { alert("Pair iyo Entry Price buuxi"); return; }
    setUploading(true);
    try {
      let setupImageURL = "";
      if (setupImage) {
        const storageRef = ref(storage, `trades/${user.uid}/setup_${Date.now()}`);
        await uploadBytes(storageRef, setupImage);
        setupImageURL = await getDownloadURL(storageRef);
      }
      const docData = {
        ...tradeData,
        setupImageURL,
        rrr: rrr || "",
        userId: user.uid,
        userEmail: user.email,
        userName: profileData?.displayName || user.email.split("@")[0],
        createdAt: Date.now(),
      };
      await onSave(docData);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #111 0%, #0d0d0d 100%)",
          border: "1px solid rgba(234,179,8,0.3)",
          boxShadow: "0 0 80px rgba(234,179,8,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-yellow-500/20">
          <div>
            <h2 className="text-3xl font-black text-yellow-400">New Trade Entry</h2>
            <p className="text-slate-500 text-sm mt-1">
              Step {step} of 2 — {step === 1 ? "Trade Details" : "Psychology & Setup"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition p-2">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          {step === 1 && (
            <div className="space-y-5">
              {/* Pair + Direction */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-bold">Currency Pair</label>
                  <select
                    value={tradeData.pair}
                    onChange={(e) => setTradeData({ ...tradeData, pair: e.target.value })}
                    className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition text-white font-bold"
                  >
                    {CURRENCY_PAIRS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-bold">Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["BUY", "SELL"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setTradeData({ ...tradeData, direction: d })}
                        className={`p-4 rounded-2xl font-black flex items-center justify-center gap-2 transition border ${
                          tradeData.direction === d
                            ? d === "BUY"
                              ? "bg-green-500/20 border-green-500 text-green-400"
                              : "bg-red-500/20 border-red-500 text-red-400"
                            : "bg-black border-zinc-800 text-slate-400"
                        }`}
                      >
                        {d === "BUY" ? <FaArrowUp /> : <FaArrowDown />}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Entry / SL / TP */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "entryPrice", label: "Entry Price", placeholder: "1.0850" },
                  { key: "stopLoss", label: "Stop Loss", placeholder: "1.0800" },
                  { key: "takeProfit", label: "Take Profit", placeholder: "1.1000" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-slate-400 text-sm mb-2 block font-bold">{label}</label>
                    <input
                      type="number"
                      step="any"
                      placeholder={placeholder}
                      value={tradeData[key]}
                      onChange={(e) => setTradeData({ ...tradeData, [key]: e.target.value })}
                      className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition text-white"
                    />
                  </div>
                ))}
              </div>

              {/* RRR live badge */}
              {rrr && (
                <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-3">
                  <FaTrophy className="text-yellow-400" />
                  <span className="text-yellow-400 font-black">
                    Risk:Reward = 1:{rrr}
                  </span>
                  <span className={`ml-auto text-sm font-bold ${parseFloat(rrr) >= 2 ? "text-green-400" : parseFloat(rrr) >= 1 ? "text-yellow-400" : "text-red-400"}`}>
                    {parseFloat(rrr) >= 2 ? "✅ Great RRR" : parseFloat(rrr) >= 1 ? "⚠️ Acceptable" : "❌ Risky"}
                  </span>
                </div>
              )}

              {/* Lot + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-bold">Lot Size</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.10"
                    value={tradeData.lotSize}
                    onChange={(e) => setTradeData({ ...tradeData, lotSize: e.target.value })}
                    className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block font-bold">Status</label>
                  <select
                    value={tradeData.status}
                    onChange={(e) => setTradeData({ ...tradeData, status: e.target.value })}
                    className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition text-white font-bold"
                  >
                    <option value="Open">Open 🟢</option>
                    <option value="Win">Win ✅</option>
                    <option value="Loss">Loss ❌</option>
                    <option value="Breakeven">Breakeven ➖</option>
                  </select>
                </div>
              </div>

              {/* Pips + P&L (only if closed) */}
              {tradeData.status !== "Open" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block font-bold">Pips</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 50"
                      value={tradeData.pips}
                      onChange={(e) => setTradeData({ ...tradeData, pips: e.target.value })}
                      className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block font-bold">Profit / Loss ($)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 150 or -50"
                      value={tradeData.profit_loss}
                      onChange={(e) => setTradeData({ ...tradeData, profit_loss: e.target.value })}
                      className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400 text-sm mb-2 block font-bold">Strategy</label>
                <input
                  type="text"
                  placeholder="e.g. ICT, SMC, Scalping..."
                  value={tradeData.strategy}
                  onChange={(e) => setTradeData({ ...tradeData, strategy: e.target.value })}
                  className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition text-white"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div
                className="rounded-2xl p-5 mb-2"
                style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.2)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FaBrain className="text-yellow-400" />
                  <span className="text-yellow-400 font-black">Psychology Section</span>
                </div>
                <p className="text-slate-500 text-sm">Qor dareenkaga iyo nafsaddaada ganacsigaan — muhiim buu u yahay horumarkaaga</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block font-bold">Dareenkaaga (Emotion)</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Calm 😌", "Confident 💪", "FOMO 😰", "Greedy 🤑", "Revenge 😡", "Tired 😴"].map((e) => (
                    <button
                      key={e}
                      onClick={() => setTradeData({ ...tradeData, emotion: e })}
                      className={`p-3 rounded-xl text-sm font-bold transition border ${
                        tradeData.emotion === e
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                          : "bg-black border-zinc-800 text-slate-400 hover:border-zinc-600"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block font-bold">
                  Xusuus-qorka Nafsadda (Psychology Notes)
                </label>
                <textarea
                  placeholder="Maxaad ka fikiraysay ganacsigaan? Miyaad dejisan tahay? Miyaad cabsanaysay? Xeer ahaan miyaad raacday...?"
                  value={tradeData.notes_psychology}
                  onChange={(e) => setTradeData({ ...tradeData, notes_psychology: e.target.value })}
                  className="w-full h-36 bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/60 transition resize-none text-white"
                />
              </div>

              {/* Chart screenshot upload */}
              <div>
                <label className="text-slate-400 text-sm mb-2 block font-bold">
                  Chart Setup Sawir (Optional)
                </label>
                <input ref={imgRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />
                {setupImagePreview ? (
                  <div className="relative">
                    <img src={setupImagePreview} alt="setup" className="w-full max-h-48 object-cover rounded-2xl" />
                    <button
                      onClick={() => { setSetupImage(null); setSetupImagePreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imgRef.current?.click()}
                    className="border-2 border-dashed border-yellow-500/25 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 transition"
                    style={{ background: "rgba(234,179,8,0.02)" }}
                  >
                    <FaUpload className="text-yellow-400 text-2xl mb-2" />
                    <p className="text-yellow-400 font-bold text-sm">Upload Chart Screenshot</p>
                    <p className="text-slate-600 text-xs mt-1">PNG, JPG</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 border-t border-yellow-500/10 flex justify-between items-center">
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            className="px-6 py-3 rounded-2xl border border-zinc-700 text-slate-400 font-bold hover:border-zinc-500 transition"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="px-8 py-3 rounded-2xl font-black text-black text-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #EAB308, #F59E0B)" }}
            >
              Next: Psychology →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-8 py-3 rounded-2xl font-black text-black text-lg flex items-center gap-2 transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #EAB308, #F59E0B)" }}
            >
              <FaSave />
              {uploading ? "Saving..." : "Save Trade"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function JournalTrading() {
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewTradeModal, setShowNewTradeModal] = useState(false);

  // Profile
  const [profileData, setProfileData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const photoInputRef = useRef(null);

  // Community post
  const [postCaption, setPostCaption] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [postFilePreview, setPostFilePreview] = useState(null);
  const [postType, setPostType] = useState("image");
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchTrades();
    fetchProfile();
  }, []);

  // ─── PROFILE ───────────────────────────────────────────────
  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, "profiles", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setProfileData(snap.data());
    } else {
      const defaultData = {
        displayName: user.email.split("@")[0],
        photoURL: "",
        nameChangedAt: null,
        strategy: "Not Set",
        createdAt: Date.now(),
      };
      await setDoc(docRef, defaultData);
      setProfileData(defaultData);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = auth.currentUser;
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/avatar_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "profiles", user.uid), { photoURL: url });
      setProfileData((prev) => ({ ...prev, photoURL: url }));
    } catch (err) {
      alert(err.message);
    }
  };

  const canChangeName = () => {
    if (!profileData?.nameChangedAt) return true;
    return (Date.now() - profileData.nameChangedAt) / (1000 * 60 * 60 * 24) >= 7;
  };

  const daysUntilNameChange = () => {
    if (!profileData?.nameChangedAt) return 0;
    return Math.ceil(7 - (Date.now() - profileData.nameChangedAt) / (1000 * 60 * 60 * 24));
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    if (!canChangeName()) {
      setNameError(`Waxaad sugaysaa ${daysUntilNameChange()} maalmood oo kale`);
      return;
    }
    const user = auth.currentUser;
    await updateDoc(doc(db, "profiles", user.uid), {
      displayName: newName.trim(),
      nameChangedAt: Date.now(),
    });
    setProfileData((prev) => ({ ...prev, displayName: newName.trim(), nameChangedAt: Date.now() }));
    setEditingName(false);
    setNameError("");
  };

  // ─── TRADES ────────────────────────────────────────────────
  const fetchTrades = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, "trades"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    setTrades(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleSaveTrade = async (tradeDoc) => {
    const user = auth.currentUser;
    const saved = await addDoc(collection(db, "trades"), tradeDoc);
    await addDoc(collection(db, "adminNotifications"), {
      type: "new_trade",
      tradeId: saved.id,
      userId: user.uid,
      userEmail: user.email,
      pair: tradeDoc.pair,
      direction: tradeDoc.direction,
      status: tradeDoc.status,
      createdAt: Date.now(),
      read: false,
    });
    fetchTrades();
  };

  // ─── DASHBOARD STATS ───────────────────────────────────────
  const totalTrades = trades.length;
  const closedTrades = trades.filter((t) => t.status !== "Open");
  const wins = trades.filter((t) => t.status === "Win").length;
  const winRate = closedTrades.length ? Math.round((wins / closedTrades.length) * 100) : 0;
  const monthlyProfit = trades.reduce((acc, t) => acc + Number(t.profit_loss || 0), 0);

  // Average RRR from saved trades
  const tradesWithRRR = trades.filter((t) => t.rrr && !isNaN(parseFloat(t.rrr)));
  const avgRRR = tradesWithRRR.length
    ? (tradesWithRRR.reduce((a, b) => a + parseFloat(b.rrr), 0) / tradesWithRRR.length).toFixed(2)
    : "–";

  const traderName = profileData?.displayName || auth.currentUser?.email?.split("@")[0] || "Trader";
  const avatarURL = profileData?.photoURL || `https://ui-avatars.com/api/?name=${traderName}&background=EAB308&color=000`;

  // ─── COMMUNITY ─────────────────────────────────────────────
  const handleFileSelect = (type) => {
    setPostType(type);
    if (type === "image") photoRef.current?.click();
    else if (type === "video") videoRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPostFile(file);
    setPostFilePreview(URL.createObjectURL(file));
  };

  const createCommunityPost = async () => {
    try {
      const user = auth.currentUser;
      if (!user) { alert("Please Login"); return; }
      if (!postCaption && !postFile) { alert("Write something or upload media"); return; }
      setUploading(true);
      let mediaURL = "", mediaType = "";
      if (postFile) {
        const storageRef = ref(storage, `community/${Date.now()}_${postFile.name}`);
        await uploadBytes(storageRef, postFile);
        mediaURL = await getDownloadURL(storageRef);
        mediaType = postFile.type.startsWith("video") ? "video" : "image";
      }
      const avatar = profileData?.photoURL || `https://ui-avatars.com/api/?name=${traderName}&background=EAB308&color=000`;
      await addDoc(collection(db, "posts"), {
        uid: user.uid, userName: traderName, profileImage: avatar,
        caption: postCaption, mediaURL, mediaType, likes: [], followers: [], createdAt: Date.now(),
      });
      setPostCaption(""); setPostFile(null); setPostFilePreview(null);
      setUploading(false);
      alert("Post Uploaded ✅");
    } catch (error) {
      setUploading(false);
      alert(error.message);
    }
  };

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">

      {/* Modal */}
      {showNewTradeModal && (
        <NewTradeModal
          onClose={() => setShowNewTradeModal(false)}
          onSave={handleSaveTrade}
          profileData={profileData}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div className="w-[280px] bg-zinc-950 border-r border-yellow-500/20 p-6 hidden lg:flex flex-col">
        <h1 className="text-4xl font-black text-yellow-400 mb-12">DREAM CRT</h1>
        <div className="space-y-3">
          {[
            { id: "dashboard", icon: <FaChartPie />, label: "Dashboard" },
            { id: "journal", icon: <FaHistory />, label: "Journal" },
            { id: "backtesting", icon: <FaChartLine />, label: "Backtesting" },
            { id: "psychology", icon: <FaBrain />, label: "Psychology" },
            { id: "community", icon: <FaRocket />, label: "Community" },
            { id: "settings", icon: <FaCog />, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition ${
                activeTab === item.id ? "bg-yellow-500 text-black" : "hover:bg-zinc-900 text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="flex-1 overflow-y-auto">

        {/* TOPBAR */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-yellow-500/20">
          <div>
            <h1 className="text-4xl font-black text-yellow-400">Trading Journal</h1>
            <p className="text-slate-400 mt-1">Welcome Back, {traderName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={avatarURL} alt="" className="w-14 h-14 rounded-full border-2 border-yellow-500 object-cover" />
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-yellow-500 text-black rounded-full p-1 hover:bg-yellow-400"
              >
                <FaCamera size={10} />
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
            </div>
            <div>
              {editingName ? (
                <div className="flex gap-2 items-center">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-zinc-800 text-yellow-400 px-3 py-1 rounded-xl text-sm outline-none border border-yellow-500/40"
                    placeholder="New name..."
                  />
                  <button onClick={saveName} className="text-xs bg-yellow-500 text-black px-3 py-1 rounded-xl font-bold">Save</button>
                  <button onClick={() => { setEditingName(false); setNameError(""); }} className="text-xs text-slate-400">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-yellow-400 text-lg">{traderName}</h1>
                  <button
                    onClick={() => {
                      if (!canChangeName()) { setNameError(`Waxaad sugaysaa ${daysUntilNameChange()} maalmood`); return; }
                      setNewName(traderName); setEditingName(true);
                    }}
                    className="text-xs text-slate-500 hover:text-yellow-400"
                  >✏️</button>
                </div>
              )}
              {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
              <p className="text-slate-400 text-sm">Professional Trader</p>
            </div>
            <div className="bg-zinc-900 p-3 rounded-xl cursor-pointer hover:bg-zinc-800"><FaSearch /></div>
            <div className="bg-zinc-900 p-3 rounded-xl relative cursor-pointer hover:bg-zinc-800">
              <FaBell />
              <div className="absolute -top-1 -right-1 bg-yellow-500 w-3 h-3 rounded-full" />
            </div>
          </div>
        </div>

        {/* ── DASHBOARD TAB ── */}
        {(activeTab === "dashboard" || activeTab === "journal") && (
          <>
            {/* STATS */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 p-10">
              {[
                { label: "Total Trades", value: totalTrades, color: "text-yellow-400", icon: <FaChartBar /> },
                { label: "Win Rate", value: `${winRate}%`, color: "text-green-400", icon: <FaTrophy /> },
                {
                  label: "Monthly Profit",
                  value: `${monthlyProfit >= 0 ? "+" : ""}$${monthlyProfit.toFixed(2)}`,
                  color: monthlyProfit >= 0 ? "text-yellow-400" : "text-red-400",
                  icon: <FaFire />,
                },
                {
                  label: "Avg Risk:Reward",
                  value: avgRRR !== "–" ? `1:${avgRRR}` : "–",
                  color: "text-cyan-400",
                  icon: <FaChartLine />,
                },
                { label: "Followers", value: "0", color: "text-pink-500" },
                { label: "Total Likes", value: "0", color: "text-red-500" },
                { label: "Open Trades", value: trades.filter((t) => t.status === "Open").length, color: "text-blue-400" },
                { label: "Closed Trades", value: closedTrades.length, color: "text-slate-300" },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-900 p-8 rounded-3xl">
                  <p className="text-slate-400 text-lg">{s.label}</p>
                  <p className={`text-5xl font-black mt-4 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* NEW TRADE BUTTON */}
            <div className="px-10 pb-2">
              <button
                onClick={() => setShowNewTradeModal(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-black text-xl hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg, #EAB308, #F59E0B)" }}
              >
                <FaPlus /> New Trade
              </button>
            </div>

            {/* TRADE HISTORY */}
            <div className="px-10 py-10">
              <div className="bg-zinc-900 rounded-3xl p-10">
                <h1 className="text-4xl font-black text-yellow-400 mb-10">Trade History</h1>
                {trades.length === 0 ? (
                  <div className="text-center text-slate-400 text-2xl py-20">No Trades Yet</div>
                ) : (
                  <div className="space-y-4">
                    {trades.map((trade) => {
                      const statusColor =
                        trade.status === "Win" ? "text-green-400" :
                        trade.status === "Loss" ? "text-red-400" :
                        trade.status === "Open" ? "text-blue-400" : "text-slate-400";
                      const plNum = Number(trade.profit_loss || 0);
                      return (
                        <div key={trade.id} className="bg-black p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${trade.direction === "BUY" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                                {trade.direction === "BUY"
                                  ? <FaArrowUp className="text-green-400" />
                                  : <FaArrowDown className="text-red-400" />
                                }
                              </div>
                              <div>
                                <h2 className="text-2xl font-black text-yellow-400">{trade.pair}</h2>
                                <p className="text-slate-500 mt-1 text-sm">
                                  {trade.direction} • Entry: {trade.entryPrice} • SL: {trade.stopLoss} • TP: {trade.takeProfit}
                                </p>
                                {trade.strategy && <p className="text-slate-600 text-xs mt-1">📊 {trade.strategy}</p>}
                                {trade.emotion && <p className="text-slate-600 text-xs">🧠 {trade.emotion}</p>}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <span className={`text-2xl font-black ${statusColor}`}>{trade.status}</span>
                              {trade.profit_loss !== "" && trade.profit_loss !== undefined && (
                                <p className={`font-black text-lg ${plNum >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {plNum >= 0 ? "+" : ""}${plNum}
                                </p>
                              )}
                              {trade.rrr && (
                                <p className="text-cyan-400 text-sm font-bold">RRR 1:{trade.rrr}</p>
                              )}
                              {trade.pips && (
                                <p className="text-slate-500 text-sm">{trade.pips} pips</p>
                              )}
                              {trade.lotSize && (
                                <p className="text-slate-500 text-sm">Lot: {trade.lotSize}</p>
                              )}
                            </div>
                          </div>
                          {/* Psychology notes preview */}
                          {trade.notes_psychology && (
                            <div className="mt-4 bg-zinc-900 rounded-xl p-3 border-l-2 border-yellow-500/40">
                              <p className="text-yellow-500/60 text-xs font-bold mb-1">🧠 PSYCHOLOGY NOTE</p>
                              <p className="text-slate-400 text-sm">{trade.notes_psychology}</p>
                            </div>
                          )}
                          {/* Setup image preview */}
                          {trade.setupImageURL && (
                            <div className="mt-3">
                              <img src={trade.setupImageURL} alt="setup" className="h-32 rounded-xl object-cover" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── PSYCHOLOGY TAB ── */}
        {activeTab === "psychology" && (
          <div className="p-10">
            <div className="bg-zinc-900 rounded-3xl p-10">
              <h1 className="text-4xl font-black text-yellow-400 mb-2">Psychology Journal</h1>
              <p className="text-slate-500 mb-8">Nafsaddaada iyo dareemtaada ka waran</p>

              {/* Emotion breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {["Calm 😌","Confident 💪","FOMO 😰","Greedy 🤑","Revenge 😡","Tired 😴"].map((emo) => {
                  const count = trades.filter((t) => t.emotion === emo).length;
                  const wins = trades.filter((t) => t.emotion === emo && t.status === "Win").length;
                  return (
                    <div key={emo} className="bg-black rounded-2xl p-5 border border-zinc-800">
                      <p className="text-lg font-bold text-white">{emo}</p>
                      <p className="text-slate-500 text-sm mt-1">{count} trades</p>
                      <p className="text-green-400 text-sm">{count ? Math.round((wins/count)*100) : 0}% win rate</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent psychology notes */}
              <h2 className="text-2xl font-black text-yellow-400 mb-5">Recent Notes</h2>
              {trades.filter((t) => t.notes_psychology).length === 0 ? (
                <p className="text-slate-500 text-center py-10">Weli notes lama qorin</p>
              ) : (
                <div className="space-y-4">
                  {trades.filter((t) => t.notes_psychology).map((t) => (
                    <div key={t.id} className="bg-black rounded-2xl p-5 border border-zinc-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-yellow-400 font-bold">{t.pair} — {t.direction}</span>
                        {t.emotion && <span className="text-slate-500 text-sm">{t.emotion}</span>}
                      </div>
                      <p className="text-slate-300">{t.notes_psychology}</p>
                      {t.setupImageURL && (
                        <img src={t.setupImageURL} alt="chart" className="mt-3 h-28 rounded-xl object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMMUNITY TAB ── */}
        {activeTab === "community" && (
          <div className="p-10">
            <div
              className="rounded-3xl p-10 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0d0d0d 100%)",
                border: "1px solid rgba(234,179,8,0.3)",
                boxShadow: "0 0 60px rgba(234,179,8,0.05)",
              }}
            >
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle, #EAB308, transparent 70%)", transform: "translate(30%, -30%)" }}
              />
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-black text-yellow-400 mb-2">Share To Community</h1>
                  <p className="text-slate-400">Show your trading setup & ideas to the community</p>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-yellow-500/50"
                  style={{ background: "radial-gradient(circle, rgba(234,179,8,0.2), rgba(234,179,8,0.05))" }}>
                  <FaRocket className="text-yellow-400 text-xl" />
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent mb-8" />

              <div className="flex items-center justify-between bg-zinc-900/80 rounded-2xl p-5 mb-6 border border-zinc-800">
                <div className="flex items-center gap-4">
                  <img src={avatarURL} alt="" className="w-12 h-12 rounded-full border-2 border-yellow-500 object-cover" />
                  <div>
                    <p className="font-black text-white">{traderName}</p>
                    <p className="text-slate-400 text-sm">Professional Trader</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border border-zinc-700 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-sm font-bold">LIVE</span>
                </div>
              </div>

              <div className="relative mb-6">
                <textarea
                  placeholder="Share your setup, analysis or market update..."
                  value={postCaption}
                  onChange={(e) => { if (e.target.value.length <= 1000) setPostCaption(e.target.value); }}
                  className="w-full h-40 bg-zinc-900/80 p-5 rounded-2xl outline-none border border-zinc-800 focus:border-yellow-500/50 transition resize-none text-white"
                />
                <span className="absolute bottom-4 right-4 text-slate-500 text-sm">{postCaption.length}/1000</span>
              </div>

              <div
                onClick={() => photoRef.current?.click()}
                className="border-2 border-dashed border-yellow-500/30 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/60 transition mb-6"
                style={{ background: "rgba(234,179,8,0.02)" }}
              >
                {postFilePreview ? (
                  postType === "video"
                    ? <video src={postFilePreview} className="max-h-48 rounded-xl" controls />
                    : <img src={postFilePreview} alt="" className="max-h-48 rounded-xl object-cover" />
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full border-2 border-yellow-500/60 flex items-center justify-center mb-4"
                      style={{ background: "radial-gradient(circle, rgba(234,179,8,0.15), transparent)" }}>
                      <FaPaperPlane className="text-yellow-400 text-xl rotate-45" />
                    </div>
                    <p className="text-yellow-400 font-bold text-lg mb-1">Upload Image or Video</p>
                    <p className="text-slate-500 text-sm">PNG, JPG, MP4 supported</p>
                  </>
                )}
              </div>

              <input ref={photoRef} type="file" accept="image/*" hidden onChange={onFileChange} />
              <input ref={videoRef} type="file" accept="video/*" hidden onChange={onFileChange} />

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-3">
                  {[
                    { icon: <FaImage />, label: "Photo", action: () => handleFileSelect("image") },
                    { icon: <FaVideo />, label: "Video", action: () => handleFileSelect("video") },
                    { icon: <FaChartBar />, label: "Chart", action: () => handleFileSelect("image") },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action}
                      className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-yellow-500/50 px-5 py-3 rounded-xl font-bold transition text-white">
                      <span className="text-yellow-400">{btn.icon}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={createCommunityPost}
                  disabled={uploading}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-black text-lg transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #EAB308, #F59E0B)" }}
                >
                  <FaPaperPlane />
                  {uploading ? "Uploading..." : "Post Community"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder tabs */}
        {["backtesting", "settings"].includes(activeTab) && (
          <div className="flex items-center justify-center h-96 text-slate-500 text-2xl capitalize">
            {activeTab} — Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}