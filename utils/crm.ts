import { CMS } from './cms';
import { supabase } from './supabaseClient';
 
/**
 * Pushes lead data to external CRMs.
 * Supports:
 * 1. Zapier Webhook (Legacy/Direct)
 * 2. Zoho CRM (Via Supabase Edge Function to protect credentials)
 */
export const syncLeadToCRM = async (leadData: any) => {
  try {
    const settings = await CMS.getSettings();
    const integrations = settings.integrations;
 
    if (!integrations?.enableAutoSync) {
        console.log("Auto-sync is disabled.");
        return { success: false, message: "Auto-sync disabled" };
    }
 
    let syncResults = [];
 
    // 1. ZOHO CRM (Direct Integration via Backend)
    if (integrations?.zoho?.enabled) {
        console.log("Invoking Edge Function for Zoho CRM Sync...");
        // Pass 'config' so the edge function has credentials to generate access tokens
        const { data, error } = await supabase.functions.invoke('sync-zoho', {
            body: {
                action: 'exchange_token',
                lead: leadData,
                config: integrations.zoho
            }
        });
 
        if (error) {
            console.error("Zoho Edge Function Error:", error);
            syncResults.push("Zoho Failed");
        } else if (data && data.error) {
             console.error("Zoho API Error:", data.error);
             syncResults.push("Zoho API Failed");
        } else {
             console.log("Zoho Sync Success:", data);
             syncResults.push("Zoho Synced");
        }
    }
 
    // 2. ZAPIER WEBHOOK (Legacy)
    if (integrations?.zapierWebhook) {
        const response = await fetch(integrations.zapierWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...leadData,
                source: 'StylenSurface Website',
                timestamp: new Date().toISOString()
            }),
        });
 
        if (response.ok) {
             syncResults.push("Zapier Synced");
        } else {
             syncResults.push("Zapier Failed");
        }
    }
 
    return {
        success: !syncResults.includes("Zoho Failed") && !syncResults.includes("Zapier Failed"),
        message: syncResults.join(", ")
    };
 
  } catch (error) {
    console.error("CRM Sync Critical Error:", error);
    return { success: false, error };
  }
};
 
/**
 * Exchanges Zoho Authorization Code for Refresh Token via Backend
 */
export const exchangeZohoAuthCode = async (authCode: string) => {
    try {
        const settings = await CMS.getSettings();
        const zohoConfig = settings.integrations?.zoho;
 
        if (!zohoConfig?.clientId || !zohoConfig?.clientSecret) {
            return { success: false, message: "Please save Client ID and Secret in settings before generating token." };
        }
 
        console.log("Invoking Edge Function to exchange auth code...");
        // Pass Client ID and Secret explicitly so Edge Function can exchange code for token
        const { data, error } = await supabase.functions.invoke('sync-zoho', {
            body: {
                action: 'exchange_token',
                authCode: authCode,
                clientId: zohoConfig.clientId,
                clientSecret: zohoConfig.clientSecret,
                domain: zohoConfig.domain || 'in'
            }
        });
 
        if (error) {
            console.error("Token Exchange Edge Error:", error);
            return { success: false, message: error.message };
        }
       
        if (data && data.error) {
            console.error("Token Exchange API Error:", data.error);
            return { success: false, message: data.error };
        }
 
        return { success: true, refresh_token: data.refresh_token };
 
    } catch (e) {
        console.error("Token Exchange Logic Error:", e);
        return { success: false, error: e };
    }
};
 
/**
 * Handles Email Notification Logic (SMTP).
 * Calls Supabase Edge Function 'send-lead-email' to perform the secure SMTP dispatch.
 */
export const sendEmailNotification = async (leadData: any) => {
    try {
        const settings = await CMS.getSettings();
        if (!settings.integrations?.smtp?.enabled) return { success: true, message: 'Skipped (Disabled)' };
 
        console.log("Invoking Edge Function to send email...");
       
        // We invoke the server-side function.
        // The function will securely fetch the SMTP credentials from the database and send the email.
        const { data, error } = await supabase.functions.invoke('send-lead-email', {
            body: { lead: leadData }
        });
 
        if (error) {
            console.error("Edge Function Error:", error);
            return { success: false, message: error.message };
        }
 
        console.log("Email Notification Sent Successfully via Edge Function.");
        return { success: true };
 
    } catch (e) {
        console.error("Email Logic Error:", e);
        return { success: false, error: e };
    }
}