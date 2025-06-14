
import { toast } from '@/hooks/use-toast';

export interface StorageOptions {
  key: string;
  fallbackData?: any;
  showErrors?: boolean;
}

export class DataStorage {
  static save<T>(key: string, data: T, showErrors = true): boolean {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
      
      if (showErrors) {
        toast({
          title: 'Storage Error',
          description: 'Failed to save data. Changes may be lost.',
          variant: 'destructive',
        });
      }
      
      return false;
    }
  }

  static load<T>(key: string, fallbackData?: T, showErrors = true): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      return fallbackData as T;
    } catch (error) {
      console.error(`Error loading data from localStorage (${key}):`, error);
      
      if (showErrors) {
        toast({
          title: 'Storage Error',
          description: 'Failed to load saved data. Using defaults.',
          variant: 'destructive',
        });
      }
      
      return fallbackData as T;
    }
  }

  static remove(key: string, showErrors = true): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data from localStorage (${key}):`, error);
      
      if (showErrors) {
        toast({
          title: 'Storage Error',
          description: 'Failed to remove data.',
          variant: 'destructive',
        });
      }
      
      return false;
    }
  }

  static clear(showErrors = true): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      
      if (showErrors) {
        toast({
          title: 'Storage Error',
          description: 'Failed to clear storage.',
          variant: 'destructive',
        });
      }
      
      return false;
    }
  }

  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// Export utility functions for direct use
export const saveData = DataStorage.save;
export const loadData = DataStorage.load;
export const removeData = DataStorage.remove;
export const clearData = DataStorage.clear;
export const isStorageAvailable = DataStorage.isAvailable;
