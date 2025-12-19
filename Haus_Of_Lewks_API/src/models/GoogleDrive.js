import mongoose from 'mongoose';

const GoogleDriveSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, required: true }
  },
  { timestamps: true }
);

const GoogleDriveModel = mongoose.model('GoogleDrive', GoogleDriveSchema);
export default GoogleDriveModel;
