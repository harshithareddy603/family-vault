import * as FileSystem from 'expo-file-system';

const BASE_DIR = FileSystem.documentDirectory + 'files/';

const ensureDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(BASE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BASE_DIR, { intermediates: true });
  }
};

export const saveFileLocal = async (id: string, content: any) => {
  try {
    await ensureDir();
    const fileName = id.replace(/[\/\\?%*:|"<>]/g, '-');
    const fileUri = BASE_DIR + fileName;
    
    // In RN, content might already be a local URI or we might need to copy it
    if (typeof content === 'string' && content.startsWith('file://')) {
      await FileSystem.copyAsync({ from: content, to: fileUri });
    } else {
      // Fallback or handle other types
      console.warn("Unsupported file content type for local save");
    }
    return true;
  } catch (e) {
    console.error("Failed to save file locally", e);
    return false;
  }
};

export const getFileLocal = async (id: string): Promise<string | null> => {
  try {
    const fileName = id.replace(/[\/\\?%*:|"<>]/g, '-');
    const fileUri = BASE_DIR + fileName;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists ? fileUri : null;
  } catch (e) {
    console.error("Failed to get file locally", e);
    return null;
  }
};

export const deleteFileLocal = async (id: string) => {
  try {
    const fileName = id.replace(/[\/\\?%*:|"<>]/g, '-');
    const fileUri = BASE_DIR + fileName;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
    return true;
  } catch (e) {
    console.error("Failed to delete file locally", e);
    return false;
  }
};
