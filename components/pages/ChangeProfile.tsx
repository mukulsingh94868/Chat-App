"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ChangeProfile = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleFile = (f?: File) => {
    const selected = f ?? inputRef.current?.files?.[0] ?? null;
    if (!selected) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("avatar", file);

      // Example: POST to /api/profile/avatar (adjust server route if needed)
      await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-start justify-center p-6 md:p-8">
      <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              aria-label="Go back"
              onClick={() => router.back()}
              className="rounded-full border border-white/10 p-2 text-sm text-slate-300 hover:bg-white/5"
            >
              ←
            </button>

            <div>
              <h2 className="text-xl md:text-2xl font-bold">Change Profile</h2>
              <p className="text-sm text-slate-400 mt-1">
                Update your display picture and profile information.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="col-span-1 flex flex-col items-center">
            <div className="relative">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border border-white/10 bg-white/3 shadow-lg">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src="/assets/goku.jpg"
                    alt="current"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={handleSelect}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                Upload
              </button>

              <button
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
              >
                Remove
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => handleFile()}
            />
          </div>

          <div className="md:col-span-2">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="rounded-xl border-2 border-dashed border-white/6 p-4 md:p-6 text-center"
            >
              <p className="text-slate-300">
                Drag & drop an image here, or use the Upload button.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                PNG, JPG, or GIF — max 5MB.
              </p>

              <div className="mt-6 flex items-center gap-3 justify-center md:justify-end">
                <button
                  onClick={handleSave}
                  disabled={!file || saving}
                  className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ChangeProfile;