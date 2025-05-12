import { useState } from 'react';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  folder?: string; // Optional folder name
}

export default function ImageUploader({ onUploadSuccess, folder = "saved-photos" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG or PNG image.");
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setError("File size exceeds 5MB. Please upload a smaller image.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log("Uploading image to S3...");
      const result = await uploadData({
        data: file,
        path: `${folder}/${file.name}`,
        options: { contentType: file.type }
      }).result;
      console.log("Upload successful:", result);

      // Import and parse amplify_outputs.json to get bucket name
      const amplifyOutputs = require('../../amplify_outputs.json');
      const bucketName = amplifyOutputs.storage.bucket_name;
      const region = 'us-east-2';
      // Construct permanent S3 URL
      const constructedUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${result.path}`;
      console.log("Constructed URL:", constructedUrl);
      onUploadSuccess(constructedUrl);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <label
        htmlFor="file-upload"
        className="w-full max-w-xs cursor-pointer rounded-lg border-2 border-dashed border-[var(--taupe)] p-6 text-center hover:bg-[var(--bone)] transition-colors"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-[var(--taupe)]" />
          <span className="text-sm font-sans text-[var(--jet)]">
            Click to upload or drag and drop
          </span>
          <span className="text-xs font-sans text-[var(--taupe)]">
            PNG or JPG (max. 5MB)
          </span>
        </div>
        <input
          id="file-upload"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
      {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
} 