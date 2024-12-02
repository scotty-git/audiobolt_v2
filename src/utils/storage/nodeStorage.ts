import fs from 'fs';
import path from 'path';

// This is a simple file-based storage for Node.js environment
class NodeStorage {
  private storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), '.local-storage');
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath);
    }
  }

  private getFilePath(key: string): string {
    return path.join(this.storagePath, `${key}.json`);
  }

  getItem(key: string): string | null {
    try {
      const filePath = this.getFilePath(key);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      return null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      const filePath = this.getFilePath(key);
      fs.writeFileSync(filePath, value);
    } catch (error) {
      console.error('Error writing to storage:', error);
      throw error;
    }
  }

  removeItem(key: string): void {
    try {
      const filePath = this.getFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  clear(): void {
    try {
      const files = fs.readdirSync(this.storagePath);
      for (const file of files) {
        fs.unlinkSync(path.join(this.storagePath, file));
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  getAllKeys(): string[] {
    try {
      const files = fs.readdirSync(this.storagePath);
      return files.map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }
} 