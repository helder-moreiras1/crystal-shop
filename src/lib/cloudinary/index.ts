import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadProductImage(
  file: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder: "crystal-shop/products",
    public_id: publicId,
    overwrite: true,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export function getImageUrl(
  publicId: string,
  variant: "thumb" | "card" | "detail" | "hero" = "card"
) {
  const transforms: Record<string, object> = {
    thumb: { width: 200, height: 200, crop: "fill" },
    card: { width: 400, height: 400, crop: "fill" },
    detail: { width: 800, height: 800, crop: "fill" },
    hero: { width: 1200, height: 600, crop: "fill" },
  };

  return cloudinary.url(publicId, {
    ...transforms[variant],
    quality: "auto",
    fetch_format: "auto",
  });
}
