/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const cors = require("cors")({ origin: true });

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({ maxInstances: 10 });

// ── VdoCipher API Secret ──
// Kani waa secret-ka aad ku kaydin doonto Firebase Secret Manager
// (ma aha hardcoded koodhka dhexdiisa). Waxaad ku dejisaa terminal-ka:
//   firebase functions:secrets:set VDOCIPHER_SECRET
const VDOCIPHER_SECRET = defineSecret("VDOCIPHER_SECRET");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// ── getVdoOtp ──
// Soo saara OTP + playbackInfo si video VdoCipher ah loogu daawado si ammaan ah.
// URL (deploy ka dib): https://REGION-PROJECT.cloudfunctions.net/getVdoOtp?videoId=XXXX
exports.getVdoOtp = onRequest(
  { secrets: [VDOCIPHER_SECRET] },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const videoId = req.query.videoId;
        if (!videoId) {
          return res.status(400).json({ error: "videoId is required" });
        }

        // ── TODO: hubi access-ka user-ka (Firestore courseAccess) ──
        // Tusaale:
        // const email = req.query.email;
        // const accessSnap = await admin.firestore()
        //   .collection("courseAccess")
        //   .doc(`${email}_${req.query.courseId}`)
        //   .get();
        // if (!accessSnap.exists || accessSnap.data().approved !== true) {
        //   return res.status(403).json({ error: "Access denied" });
        // }

        const secret = VDOCIPHER_SECRET.value();
        if (!secret) {
          return res.status(500).json({ error: "VdoCipher secret not configured" });
        }

        const response = await fetch(
          `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
          {
            method: "POST",
            headers: {
              "Authorization": `Apisecret ${secret}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ttl: 300,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          logger.error("VdoCipher API error:", data);
          return res.status(response.status).json({ error: data });
        }

        // data = { otp: "...", playbackInfo: "..." }
        return res.status(200).json(data);
      } catch (err) {
        logger.error("getVdoOtp error:", err);
        return res.status(500).json({ error: err.message });
      }
    });
  }
);