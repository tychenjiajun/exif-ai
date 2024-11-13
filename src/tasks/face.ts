import sharp from "sharp";
import { env } from "node:process";

interface Result {
  RetCode?: number;
  Candidates?: Candidate[];
  FaceRect?: FaceRect;
}

interface Candidate {
  PersonId?: string;
  FaceId?: string;
  Score?: number;
  PersonName?: string;
  Gender?: number;
  PersonGroupInfos?: PersonGroupInfo[];
}

interface PersonGroupInfo {
  GroupId?: string;
  PersonExDescriptions?: any[];
}

interface FaceRect {
  X?: number;
  Y?: number;
  Width?: number;
  Heights?: number;
}

async function sizeHandle(
  buffer: Buffer,
  quality = 100,
  drop = 2,
): Promise<Buffer> {
  const sharpInstance = await sharp(buffer);
  const { width = 0, height = 0 } = await sharpInstance.metadata();
  let done = await sharp(buffer)
    .jpeg({
      quality,
    })
    .toBuffer();

  while (done.byteLength > 5_000_000) {
    quality = Math.max(quality - drop, 0);
    done = await sharp(buffer)
      .resize({
        ...(width > height ? { width: 4000 } : { height: 4000 }),
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
      })
      .toBuffer();
  }

  return done;
}

export async function getFaces({
  buffer,
  verbose = false,
  faceGroupIds,
}: {
  buffer: Buffer;
  verbose?: boolean;
  faceGroupIds: string[];
}) {
  const [handled, { iai }] = await Promise.all([
    sizeHandle(buffer),
    import("tencentcloud-sdk-nodejs-iai"),
  ] as const);

  const client = new iai.v20200303.Client({
    credential: {
      secretId: env.TENCENTCLOUD_SECRET_ID,
      secretKey: env.TENCENTCLOUD_SECRET_KEY,
    },
    region: "ap-guangzhou",
  });

  try {
    const a: {
      Results?: Result[];
      FaceNum?: number;
      FaceModelVersion?: string;
      RequestId?: string;
    } = await client.SearchFaces({
      GroupIds: faceGroupIds,
      Image: handled.toString("base64"),
      MaxPersonNum: 5,
      NeedPersonInfo: 1,
    });
    // log
    if (verbose) {
      console.log(a);
    }

    return a?.Results?.map((k) => k.Candidates?.[0].PersonName).filter(
      (k) => k != null,
    );
  } catch (error) {
    if (verbose) console.error("Failed to get faces", error);
    return;
  }
}
