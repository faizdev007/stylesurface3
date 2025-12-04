import axios from "axios";

export default async function handler(req, res) {
  const { code } = req.body;

  try {
    const response = await axios.post(
      `https://accounts.zoho.in/oauth/v2/token`,
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          redirect_uri: "https://stylesurface3.vercel.app",
          code,
        },
      }
    );

    return res.json(response.data); // contains refresh_token
  } catch (err) {
    return res.status(500).json({ error: err.response.data });
  }
}
