
import fs from 'fs';
import { google } from 'googleapis';
import apikeys from '../../api-ggdrive-key.json' assert { type: 'json' };
import dotenv from 'dotenv';
dotenv.config();
const SCOPE = ['https://www.googleapis.com/auth/drive'];
async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );

    await jwtClient.authorize();

    return jwtClient;
}
const useGoogleDriveUpload = async (req, res) => {
    // console.log("data back", req.file);
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
  
    // Upload the file to Google Drive
    const drive = google.drive({ version: "v3", auth: await authorize() });
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.DRIVE_PATH], // Replace with your folder ID
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };
  
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });
  
    // Extract the file ID from the webViewLink
    const track_url = file.data.id;
  
    return track_url;
  };
export default useGoogleDriveUpload;  