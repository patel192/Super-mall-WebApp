// ================= CLOUDINARY CONFIG =================
export const CLOUDINARY_CLOUD_NAME = "dfaou6haj";
export const CLOUDINARY_UPLOAD_PRESET = "supermall_products";

// ================= UPLOAD FUNCTION =================
export async function uploadImageToCloudinary(file) {
  if (!file) throw new Error("No file provided");

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url; // 🔥 This is what you store in Firestore
}
