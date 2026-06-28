import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const handleGoogleAuth = async (credential) => {
  if (!credential) {
    return { success: false, message: "No credential provided" };
  }
  try {
    console.log("I'm in");
    // Verify with Google
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return { success: false, message: "Invalid Google token" };
    }
    const { sub: googleId, email, name, picture } = payload;
    if (!email) {
      return { success: false, message: "Email not provided by Google" };
    }
    return { success: true, googleId, email, name, avatar:picture };
  } catch (error) {
    console.error(error.stack);
    return {
      success: false,
      message: "Error occurred while handling Google authentication.",
    };
  }
};
