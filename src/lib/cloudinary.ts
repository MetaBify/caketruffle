import crypto from "crypto";

type CloudinaryUploadResult = {
  secure_url: string;
};

export async function uploadToCloudinary(
  file: File,
  options?: { aspect?: "square" | "landscape" }
) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const aspect = options?.aspect ?? "square";
  const transformation =
    aspect === "landscape"
      ? "c_fill,ar_16:9,g_auto,w_1280,h_720"
      : "c_fill,ar_1:1,g_auto,w_800,h_800";
  const signatureBase = `timestamp=${timestamp}&transformation=${transformation}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase + apiSecret)
    .digest("hex");

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const form = new FormData();
  form.append("file", dataUri);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("transformation", transformation);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return data.secure_url;
}
