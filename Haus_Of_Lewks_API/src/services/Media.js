import { ReturnObject } from '../util/returnObject.js';
import { GoogleDriveManager } from './GoogleDriveManager.js';
import MediaModel from '../models/Media.js';
import logger from '../util/logger.js';

export class MediaService {
  constructor() {
    this.googleDriveManager = new GoogleDriveManager();
  }

  getAllMedia = async (req, res) => {
    try {
      const { tag, type } = req.query;

      let query = {};
      if (tag) {
        query.tag = { $in: Array.isArray(tag) ? tag : [tag] };
      }
      if (type) {
        query.type = type;
      }

      const media = await MediaModel.find(query).sort({ _id: -1 });

      const response = ReturnObject(true, media);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error getting media', error);
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while trying to get media'
      );
      return res.status(400).send(response);
    }
  };

  addMedia = async (req, res) => {
    const file = req?.file;
    let { type = 'Image', tag } = req.body;

    try {
      if (!file) {
        const response = ReturnObject(false, 'File is required');
        return res.status(400).send(response);
      }
      if (!tag) {
        const response = ReturnObject(false, 'File tag required');
        return res.status(400).send(response);
      }

      let parsedTags = tag;
      if (typeof tag === 'string') {
        try {
          parsedTags = JSON.parse(tag);
        } catch {
          parsedTags = [tag];
        }
      }

      if (!Array.isArray(parsedTags)) {
        parsedTags = [parsedTags];
      }

      let driveData = null;
      if (type === 'Image') {
        driveData = await this.googleDriveManager.uploadImageToFolder(
          file?.buffer
        );
      } else if (type === 'Video') {
        driveData = await this.googleDriveManager.uploadVideoToFolder(
          file?.buffer
        );
      }

      logger.debug('Media uploaded to Drive', { hasUrl: !!driveData.publicUrl });

      const newMedia = await MediaModel.create({
        tag: parsedTags,
        driveId: driveData.driveId,
        link: driveData.publicUrl,
        type
      });

      const response = ReturnObject(true, newMedia);
      return res.status(201).send(response);
    } catch (error) {
      logger.error('Error in addMedia', error);
      const response = ReturnObject(
        false,
        error?.message ||
          'Sorry, something went wrong while trying to save media'
      );
      return res.status(400).send(response);
    }
  };

  deleteMedia = async (req, res) => {
    const { id } = req.body;

    try {
      if (!id) {
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      const mediaToDelete = await MediaModel.findById(id);
      if (!mediaToDelete) {
        const response = ReturnObject(false, 'Media not found');
        return res.status(404).send(response);
      }

      const driveUrl = mediaToDelete?.link;
      let fileId = null;
      if (driveUrl) {
        const match = driveUrl.match(/id=([^&]+)/);
        if (match) {
          fileId = match[1];
        }
      }

      if (fileId) {
        await this.googleDriveManager.deleteFileFromDrive(fileId);
      }
      await MediaModel.deleteOne({ _id: mediaToDelete?._id });

      const response = ReturnObject(true, 'Media deleted');
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while trying to delete media'
      );
      return res.status(400).send(response);
    }
  };
}
