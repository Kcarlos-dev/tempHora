import { Storage, StorageOptions } from '@google-cloud/storage';
import config from './index';

const options: StorageOptions = {
  projectId: config.gcs.projectId || undefined,
};

if (config.gcs.keyFilename) {
  options.keyFilename = config.gcs.keyFilename;
}

const storage = new Storage(options);
const bucket = storage.bucket(config.gcs.bucketName);

export { storage, bucket };
