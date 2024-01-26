import * as s3 from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "~/env";

export const uploadToS3 = async (file: File) => {
  try {
    const s3Client = new s3.S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: env.AWS_BUCKET_NAME,
        Key: file.name,
        Body: file,
      },
    });

    const result = await upload.done();
    return `${result.Location}`;
  } catch (e) {
    throw new Error(`Error uploading file: ${String(e)}`);
  }
};
