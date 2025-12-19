import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { googleEnvVariables } from '../config/enviornment.js';
import { Readable } from 'node:stream';
import GoogleDriveModel from '../models/GoogleDrive.js';
import { data } from '@remix-run/node';

export class GoogleDriveManager {
  /**
   * Default constructor
   */
  constructor() {
    this.oauth2Client = null;
    this.googleDrive = null;
  }

  /**
   * Initialize OAuth2 client with refresh token
   */
  initOAuthWithRefreshToken = async () => {
    if (!this.oauth2Client) {
      this.oauth2Client = new google.auth.OAuth2(
        googleEnvVariables.googleClientId,
        googleEnvVariables.googleClientSecret,
        googleEnvVariables.googleCallbackUrl // FIXED
      );
    }

    const tokenDoc = await GoogleDriveModel.findOne({})
      .sort({ createdAt: -1 })
      .limit(1);

    if (!tokenDoc?.refreshToken) {
      throw new Error('No refresh token found');
    }

    this.oauth2Client.setCredentials({
      refresh_token: tokenDoc.refreshToken
    });

    this.googleDrive = google.drive({
      version: 'v3',
      auth: this.oauth2Client
    });

    return this.googleDrive;
  };

  /***********************************************************************************************/
  // File operations
  /***********************************************************************************************/
  /**
   * Generate file name for uploaded media
   * @param {*} userId
   * @returns
   */
  generateFileName() {
    const timestamp = Date.now();
    const shortUuid = uuidv4();
    return `${timestamp}${shortUuid}`.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Uploads an image to the Google Drive folder
   * @param {*} imageBuffers
   */
  uploadImageToFolder = async (imageBuffers) => {
    try {
      if (!this.googleDrive) {
        await this.initOAuthWithRefreshToken();
      }

      const key = `${this.generateFileName()}.jpg`;

      const file = await this.googleDrive.files.create({
        requestBody: {
          name: key,
          parents: [googleEnvVariables.driveImagesFolderId]
        },
        media: {
          mimeType: 'image/jpeg',
          body: Readable.from(imageBuffers)
        },
        fields: 'id, webViewLink',
        uploadType: 'resumable',
        supportsAllDrives: true
      });

      await this.googleDrive.permissions.create({
        fileId: file.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });

      const publicUrl = `https://drive.google.com/uc?export=view&id=${file.data.id}`;
      console.log({ publicUrl });

      return {
        driveId: file.data.id,
        publicUrl
      };
    } catch (error) {
      throw new Error(
        `uploadImageToFolder error: ${error?.message || error?.toString() || error}`
      );
    }
  };

  serveImageFileDrive = async (req, res) => {
    try {
      const { id } = req.params;
      if (!this.googleDrive) {
        await this.initOAuthWithRefreshToken();
      }

      console.log({ id });
      // Get file metadata (for MIME type)
      const { data: fileMeta } = await this.googleDrive.files.get({
        fileId: id,
        fields: 'name, mimeType',
        supportsAllDrives: true
      });

      // Set response headers
      res.setHeader('Content-Type', fileMeta.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${fileMeta.name}"`
      );

      // Create a readable stream from Google Drive
      const driveStream = await this.googleDrive.files.get(
        { fileId: id, alt: 'media', supportsAllDrives: true },
        { responseType: 'stream' }
      );

      driveStream.data.pipe(res);
    } catch (err) {
      console.error('Error fetching file from Drive:', err);
      res.status(500).json({ error: 'Failed to fetch file' });
    }
  };

  /**
   * Uploads a video to the Google Drive folder
   * @param {*} videoBuffer
   */
  uploadVideoToFolder = async (videoBuffer) => {
    try {
      if (!this.googleDrive) {
        await this.initOAuthWithRefreshToken();
      }

      const key = `${this.generateFileName()}.mp4`;

      const file = await this.googleDrive.files.create({
        requestBody: {
          name: key,
          parents: [googleEnvVariables.driveVideosFolderId]
        },
        media: {
          mimeType: 'video/mp4',
          body: Readable.from(videoBuffer)
        },
        fields: 'id, webViewLink',
        uploadType: 'resumable',
        supportsAllDrives: true
      });

      await this.googleDrive.permissions.create({
        fileId: file.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });

      const publicUrl = `https://drive.google.com/uc?export=download&id=${file.data.id}`;
      console.log({ publicUrl });
      return {
        driveId: file.data.id,
        publicUrl
      };
    } catch (error) {
      throw new Error(
        `uploadVideoToFolder error: ${error?.message || error?.toString() || error}`
      );
    }
  };

  /**
   * Deletes a video/image from the Google Drive folder
   * @param {*} driveId
   */
  deleteFileFromDrive = async (driveId) => {
    try {
      if (!this.googleDrive) await this.initOAuthWithRefreshToken();

      const response = await this.googleDrive.files.delete({
        fileId: driveId
      });

      console.log({ deleteFileFromDriveResponse: response.data });
      return response.data;
    } catch (error) {
      throw new Error(
        `deleteFileFromDrive error: ${error?.message || error?.toString() || error}`
      );
    }
  };
}
