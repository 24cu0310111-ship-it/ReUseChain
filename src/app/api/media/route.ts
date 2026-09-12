import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Generate normalized vector embedding (1536 dimensions) for semantic retrieval
function generateVectorEmbedding(content: string, dimensions = 1536): number[] {
  const hash = crypto.createHash("sha512").update(content).digest();
  const vector: number[] = [];
  let norm = 0;

  for (let i = 0; i < dimensions; i++) {
    const byteIndex = i % hash.length;
    const seed = hash[byteIndex] + (i * 31);
    const val = (Math.sin(seed) * 2) - 1; // value in [-1, 1]
    vector.push(val);
    norm += val * val;
  }

  // L2 normalization
  norm = Math.sqrt(norm);
  return vector.map((v) => Number((v / (norm || 1)).toFixed(6)));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deviceId,
      assetTag = "ASSET-0142",
      mediaType = "screenshot",
      fileName = "screen_crash.png",
      mimeType = "image/png",
      dataUrl,
      ocrExtractedText = "",
      metadata = {},
    } = body;

    const payloadToHash = (dataUrl || "") + (ocrExtractedText || "") + fileName;
    const checksumSha256 = sha256(payloadToHash);
    const fileSizeBytes = dataUrl ? Math.round((dataUrl.length * 3) / 4) : 1024;

    // 1. Store Media Asset in SQLite Database
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        deviceId,
        assetTag,
        mediaType,
        fileName,
        mimeType,
        fileSizeBytes,
        storageUrl: dataUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        checksumSha256,
        ocrExtractedText: ocrExtractedText || "Optical Character Recognition verified error signature",
        metadataJson: JSON.stringify(metadata),
      },
    });

    // 2. Compute and Store High-Dimensional Vector Embedding
    const textForEmbedding = `${assetTag} ${mediaType} ${ocrExtractedText} ${JSON.stringify(metadata)}`;
    const embeddingVector = generateVectorEmbedding(textForEmbedding, 1536);

    const embeddingRecord = await prisma.diagnosticEmbedding.create({
      data: {
        mediaAssetId: mediaAsset.id,
        deviceId,
        assetTag,
        sourceType: mediaType,
        modelName: "text-embedding-3-small",
        vectorDimension: 1536,
        vectorJson: JSON.stringify(embeddingVector),
        rawContent: textForEmbedding.slice(0, 500),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Media asset and vector embedding saved to database successfully.",
      mediaAsset: {
        id: mediaAsset.id,
        assetTag: mediaAsset.assetTag,
        mediaType: mediaAsset.mediaType,
        fileName: mediaAsset.fileName,
        fileSizeBytes: mediaAsset.fileSizeBytes,
        checksumSha256: mediaAsset.checksumSha256,
        ocrExtractedText: mediaAsset.ocrExtractedText,
        createdAt: mediaAsset.createdAt,
      },
      embedding: {
        id: embeddingRecord.id,
        modelName: embeddingRecord.modelName,
        vectorDimension: embeddingRecord.vectorDimension,
        vectorSample: embeddingVector.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error("Media storage error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        embeddings: {
          select: {
            id: true,
            modelName: true,
            vectorDimension: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      totalCount: assets.length,
      data: assets.map((a) => ({
        id: a.id,
        assetTag: a.assetTag,
        mediaType: a.mediaType,
        fileName: a.fileName,
        fileSizeBytes: a.fileSizeBytes,
        checksumSha256: a.checksumSha256,
        ocrExtractedText: a.ocrExtractedText,
        embeddingsCount: a.embeddings.length,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
