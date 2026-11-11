export function fitImage(file: File, maxEdge = 960, limit = 180000) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image"));
      img.onload = () => {
        let edge = maxEdge;
        let quality = 0.72;
        const paint = () => {
          const scale = Math.min(1, edge / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("canvas"));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL("image/jpeg", quality);
          if (url.length <= limit || (edge <= 280 && quality <= 0.42)) {
            resolve(url);
            return;
          }
          if (quality > 0.46) quality = Math.round((quality - 0.12) * 100) / 100;
          else edge = Math.round(edge * 0.72);
          paint();
        };
        paint();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
