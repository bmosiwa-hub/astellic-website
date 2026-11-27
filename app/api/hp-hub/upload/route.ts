import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { clientIp, rateLimitOk } from "@/lib/simple-rate-limit";
import { getHpActor } from "@/lib/hp-hub/auth";
import { ADMIN_MAX_BYTES, ADMIN_MIME_TYPES, checkFileMeta, EVIDENCE_MAX_BYTES, PUBLIC_MAX_BYTES, PUBLIC_MIME_TYPES } from "@/lib/hp-hub/files";
import { can } from "@/lib/hp-hub/permissions";
import { blobToken, uploadPrefix, type UploadArea } from "@/lib/hp-hub/storage";

export const dynamic = "force-dynamic";

/**
 * Issues short-lived, single-file upload tokens for direct browser → storage
 * uploads (so large PDFs never pass through a serverless function body).
 *
 *  - area "documents" / "evidence": HP-Hub members only.
 *  - area "submissions": public, rate-limited, PDF/Word only, 25 MB.
 *
 * The token pins the allowed content types and maximum size. After upload the
 * form's server action re-checks the file (location, size, file signature)
 * before anything references it.
 */
export async function POST(req: Request) {
  const token = blobToken();
  if (!token) return NextResponse.json({ error: "File storage is not configured." }, { status: 503 });

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      token,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: { area?: string; size?: number; name?: string } = {};
        try {
          payload = JSON.parse(clientPayload ?? "{}");
        } catch {
          /* handled below */
        }
        const area = payload.area as UploadArea | undefined;
        if (area !== "documents" && area !== "submissions" && area !== "evidence") throw new Error("Invalid upload area");

        let allowed: string[];
        let maxBytes: number;
        if (area === "submissions") {
          if (!rateLimitOk(`hp-upload:${clientIp(req)}`, 10, 60 * 60 * 1000)) throw new Error("Too many uploads. Please try again later.");
          allowed = PUBLIC_MIME_TYPES;
          maxBytes = PUBLIC_MAX_BYTES;
        } else {
          const actor = await getHpActor();
          const capability = area === "documents" ? "document.create" : "acquisition.edit";
          if (!actor || !can(actor.role, capability)) throw new Error("Not authorised");
          allowed = ADMIN_MIME_TYPES;
          maxBytes = area === "evidence" ? EVIDENCE_MAX_BYTES : ADMIN_MAX_BYTES;
        }

        if (!pathname.startsWith(uploadPrefix(area))) throw new Error("Invalid upload path");
        const meta = checkFileMeta({ name: payload.name ?? pathname, size: Number(payload.size) || 1, type: null }, { allowed, maxBytes });
        if (!meta.ok) throw new Error(meta.error);

        return {
          allowedContentTypes: allowed,
          maximumSizeInBytes: maxBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ area }),
        };
      },
      // Completion webhooks can't reach local development; the form's server
      // action verifies the upload instead, so nothing is needed here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
