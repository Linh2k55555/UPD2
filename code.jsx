import React, { useState, useEffect } from "react";

const GITHUB_USER = "Linh2k55555";
const REPO = "UPD";
const FILE_PATH = "images.json";
const BRANCH = "main";
const TOKEN = "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"; // ⚠️ không nên để lộ token trực tiếp, nên dùng server proxy

function App() {
  const [images, setImages] = useState([]);

  // Lấy images.json từ GitHub
  useEffect(() => {
    fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/${BRANCH}/${FILE_PATH}`)
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch(() => setImages([]));
  }, []);

  // Upload ảnh
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const newImages = [...images, base64];

      // Lấy SHA của file hiện tại để update
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`,
        {
          headers: { Authorization: `token ${TOKEN}` },
        }
      );
      const fileData = await res.json();

      // Commit file mới
      await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Add new image",
            content: btoa(JSON.stringify(newImages, null, 2)),
            sha: fileData.sha,
            branch: BRANCH,
          }),
        }
      );

      setImages(newImages);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📸 Lưu trữ ảnh GitHub JSON</h1>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((img, i) => (
          <div key={i} className="border p-2">
            <img src={img} alt={`uploaded-${i}`} className="w-full" />
            <textarea
              readOnly
              value={img}
              className="w-full text-xs mt-2 p-1 border"
              rows="3"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
