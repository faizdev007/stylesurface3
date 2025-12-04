import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Values from environment variables
        const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;

        // Get Zoho access token
        const tokenRes = await axios.post(
            `https://accounts.zoho.com/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`
        );

        const accessToken = tokenRes.data.access_token;

        // Data coming from React form
        const formData = req.body;

        // Create Zoho CRM Lead
        const zohoRes = await axios.post(
            "https://www.zohoapis.com/crm/v2/Leads",
            {
                data: [
                    {
                        First_Name: formData.name,
                        Full_Name: formData.name,
                        Email: formData.email,
                        Phone: formData.phone,
                        Description: formData.message,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                },
            }
        );

        return res.status(200).json({ success: true, data: zohoRes.data });
    } catch (err) {
        console.error(err.response?.data);
        return res.status(500).json({ error: true, details: err.response?.data });
    }
}
