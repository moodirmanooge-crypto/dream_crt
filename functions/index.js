const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const cors = require("cors")({ origin: true });

setGlobalOptions({ maxInstances: 10 });

// ================================
// VdoCipher API Secrets
// ================================
const VDOCIPHER_SECRET_1 = defineSecret("VDOCIPHER_SECRET_1");
const VDOCIPHER_SECRET_2 = defineSecret("VDOCIPHER_SECRET_2");
const VDOCIPHER_SECRET_3 = defineSecret("VDOCIPHER_SECRET_3");

// Dhammaan secrets-ka
const ALL_SECRETS = [
  VDOCIPHER_SECRET_1,
  VDOCIPHER_SECRET_2,
  VDOCIPHER_SECRET_3,
];

// Account kasta secret-kiisa
const ACCOUNT_SECRET_MAP = {
  account1: VDOCIPHER_SECRET_1,
  account2: VDOCIPHER_SECRET_2,
  account3: VDOCIPHER_SECRET_3,
};

// =========================================
// Generate OTP + PlaybackInfo
// =========================================
exports.getVdoOtp = onRequest(
  {
    secrets: ALL_SECRETS,
  },
  async (req, res) => {
    cors(req, res, async () => {
      try {
        const { videoId, account } = req.query;

        if (!videoId) {
          return res.status(400).json({
            success: false,
            message: "videoId is required",
          });
        }

        if (!account) {
          return res.status(400).json({
            success: false,
            message: "account is required",
          });
        }

        const secretObject = ACCOUNT_SECRET_MAP[account];

        if (!secretObject) {
          return res.status(400).json({
            success: false,
            message: "Invalid account",
          });
        }

        const apiSecret = secretObject.value();

        const response = await fetch(
          `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
          {
            method: "POST",
            headers: {
              Authorization: `Apisecret ${apiSecret}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ttl: 300,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          logger.error(data);

          return res.status(response.status).json({
            success: false,
            error: data,
          });
        }

        return res.status(200).json({
          success: true,
          otp: data.otp,
          playbackInfo: data.playbackInfo,
        });
      } catch (error) {
        logger.error(error);

        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });
  }
);