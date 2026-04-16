import { Storage } from '@google-cloud/storage';
import config from './index';

const storage = new Storage({
  projectId: config.gcs.projectId,
  keyFilename: config.gcs.keyFilename,
});

const bucket = storage.bucket(config.gcs.bucketName);

export { storage, bucket };
