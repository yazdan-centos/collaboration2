import axios from 'axios';

export function createFileUploadApi({
  baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  uploadPath = '/api/files',
  listPath = '/api/files',
} = {}) {
  const client = axios.create({ baseURL, timeout: 60000 });

  return {
    async upload(file, { onProgress, signal } = {}) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await client.post(uploadPath, formData, {
        signal,
        onUploadProgress(event) {
          if (!event.total) return;
          onProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      });
      return response.data;
    },

    async list() {
      const response = await client.get(listPath);
      return response.data;
    },

    async delete(file) {
      await client.delete(`${listPath}/${file.serverId || file.id}`);
    },

    async download(file) {
      const response = await client.get(`${listPath}/${file.serverId || file.id}/download`, {
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    },

    async share(file) {
      const response = await client.post(`${listPath}/${file.serverId || file.id}/share`);
      return response.data?.url || response.data?.shareUrl;
    },
  };
}

// In-memory API for Storybook, demos, and tests. It mirrors the production API contract.
export function createMockFileUploadApi(initialFiles = []) {
  let uploadedFiles = [...initialFiles];

  return {
    async upload(file, { onProgress, signal } = {}) {
      for (let progress = 10; progress <= 100; progress += 10) {
        await new Promise((resolve, reject) => {
          const timer = window.setTimeout(resolve, 80);
          signal?.addEventListener('abort', () => {
            window.clearTimeout(timer);
            reject(new DOMException('Upload cancelled', 'AbortError'));
          }, { once: true });
        });
        onProgress?.(progress);
      }

      const uploaded = {
        id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedUrl: URL.createObjectURL(file),
      };
      uploadedFiles = [uploaded, ...uploadedFiles];
      return uploaded;
    },
    async list() {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      return [...uploadedFiles];
    },
    async delete(file) {
      await new Promise((resolve) => window.setTimeout(resolve, 200));
      uploadedFiles = uploadedFiles.filter((item) => item.id !== file.id);
    },
    async download(file) {
      return file.uploadedUrl;
    },
    async share(file) {
      return file.uploadedUrl;
    },
  };
}
