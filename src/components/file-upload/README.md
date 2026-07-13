# FileUploadManager

`FileUploadManager` owns selection, validation, upload state, and the uploaded-file list. `PreflightFileList`, `UploadedFilesList`, `FileRow`, and `FileTypeIcon` are exported for composition in other screens.

Each selected item has this shape:

```js
{ id, file, name, size, type, progress, status, error, uploadedUrl }
```

Valid statuses are `ready`, `uploading`, `success`, `error`, and `validation-error`.

## Usage

```jsx
import FileUploadManager from './components/file-upload/FileUploadManager';
import { createFileUploadApi } from './components/file-upload/fileUploadApi';

const api = createFileUploadApi({ uploadPath: '/api/attachments', listPath: '/api/attachments' });

export default function AttachmentsPage() {
  return (
    <FileUploadManager
      api={api}
      maxFiles={8}
      maxFileSize={15 * 1024 * 1024}
      styles={{
        container: 'rounded-lg border border-blue-200 bg-white p-6 text-slate-900',
        fileRow: 'flex items-center gap-4 border-b border-blue-100 px-4 py-3',
        progressBar: 'h-full rounded-full bg-blue-600',
        button: 'rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white',
      }}
    />
  );
}
```

For a local demo, pass `createMockFileUploadApi()` instead. Every key in `FILE_UPLOAD_STYLES` can be replaced through the `styles` prop: `container`, `section`, `sectionHeader`, `dropzone`, `dropzoneActive`, `fileList`, `fileRow`, `fileIcon`, `fileInfo`, `fileName`, `fileMeta`, `error`, `progressTrack`, `progressBar`, `button`, `secondaryButton`, `iconButton`, `dangerButton`, `emptyState`, and `status`.
