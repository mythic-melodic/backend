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
class DriveController {
    async upload(req, res) {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Upload the file to Google Drive
        const drive = google.drive({ version: 'v3', auth: await authorize() });
        const fileMetadata = {
            name: req.file.originalname,
            parents: [process.env.DRIVE_PATH]// Replace with your folder ID
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path)
        };

        try {
            const file = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink'
            });

            // Extract the file ID from the webViewLink
            const fileId = file.data.id;
            const apiKey = process.env.GOOGLE_API_KEY;
            const fileType = req.file.mimetype;
            const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

            let renderData = '';

            if (fileType.includes('image')) {
                renderData = `<img src="${url}" style="width: 50px; height: 50px;" alt="Uploaded file" />`;
            } else if (fileType.includes('video')) {
                renderData = `<video src="${url}" controls width="200px" height="200px" alt="Uploaded file"></video>`;
            } else if (fileType.includes('audio')) {
                renderData = `<audio controls><source src="${url}" type="${fileType}">Your browser does not support the audio element.</audio>`;
            } else {
                renderData = `<a href="${url}" target="_blank">View File</a>`;
            }
            // Send the HTML response with the image
            res.send(`
                <p>File uploaded successfully: <a href="${file.data.webViewLink}" target="_blank">View File</a></p>
                ${renderData}
                <p>File type: ${fileType}</p>
            `);
        } catch (error) {
            res.status(500).send('Error uploading file: ' + error.message);
        } finally {
            // Clean up the uploaded file from the server
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }
    }
}
export default new DriveController();