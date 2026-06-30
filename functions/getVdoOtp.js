// functions/getVdoOtp.js
//
// Firebase Cloud Function: soo saara OTP + playbackInfo si video VdoCipher ah
// loogu daawado si ammaan ah. API Secret-ka KALIYA halkan ayuu ku jiraa
// (server-side), marnaba kuma jiro frontend-ka (React/Flutter).
//
// ── SI LOO DEJIYO ──
// 1. Terminal-ka, gudaha "functions" folder-ka:
//      firebase functions:config:set vdocipher.secret="HALKAN_KU_DAR_API_SECRET_CUSUB"
//    (ama haddii aad isticmaaleyso Functions v2 + .env, ku dar:
//      VDOCIPHER_SECRET=HALKAN_KU_DAR_API_SECRET_CUSUB
//    gudaha file la yiraahdo functions/.env — oo aan la commit-gareyn git)
//
// 2. Deploy:
//      firebase deploy --only functions:getVdoOtp
//
// 3. URL-ka soo baxa (tusaale):
//      https://us-central1-YOUR_PROJECT.cloudfunctions.net/getVdoOtp?videoId=XXXX
//    Kani waa URL-ka aad ku beddeli doonto CoursePlayer.jsx gudaheeda
//    (YOUR_CLOUD_FUNCTION_URL).
//
// MUHIIM: Marka aad deploy gareyso, hubi inaad ka tirtirto API key-gii
// hore ee la arkay screenshot-ka, oo aad samayso mid CUSUB oo aan
// la wadaagin cidna.

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

exports.getVdoOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const videoId = req.query.videoId;
      if (!videoId) {
        return res.status(400).json({ error: "videoId is required" });
      }

      // ── Hubi in user-ku leeyahay access course-kan ka hor inta otp loo siin ──
      // TODO: ku dar halkan hubinta Firestore (courseAccess collection)
      // si user aan lacag bixin u garan inuu helo otp. Tusaale:
      //
      // const email = req.query.email;
      // const accessSnap = await admin.firestore()
      //   .collection("courseAccess")
      //   .doc(`${email}_${req.query.courseId}`)
      //   .get();
      // if (!accessSnap.exists || accessSnap.data().approved !== true) {
      //   return res.status(403).json({ error: "Access denied" });
      // }

      // Beddel "vdocipher.secret" haddii aad isticmaaleyso .env (v2 functions)
      const VDOCIPHER_SECRET =
        functions.config().vdocipher?.secret || process.env.VDOCIPHER_SECRET;

      if (!VDOCIPHER_SECRET) {
        return res.status(500).json({ error: "VdoCipher secret not configured" });
      }

      const response = await fetch(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        {
          method: "POST",
          headers: {
            "Authorization": `Apisecret ${VDOCIPHER_SECRET}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ttl: 300, // OTP valid 300 seconds si loo bilaabo daawashada
            // annotate: JSON.stringify([{ type: "rtext", text: email, ... }]) // watermark ikhtiyaari ah
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("VdoCipher API error:", data);
        return res.status(response.status).json({ error: data });
      }

      // data = { otp: "...", playbackInfo: "..." }
      return res.status(200).json(data);
    } catch (err) {
      console.error("getVdoOtp error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
});