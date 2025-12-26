// Storage utility functions for data import/export
import { type AppState, isValidAppState, SCHEMA_VERSION } from '../store/types';

/**
 * Export current state as JSON file for download
 */
export const exportDataAsJSON = (state: AppState): void => {
  try {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data. Please try again.');
  }
};

/**
 * Import and validate state from JSON file
 * @returns { success: boolean, state?: AppState, error?: string }
 */
export const importDataFromJSON = async (file: File): Promise<{
  success: boolean;
  state?: AppState;
  error?: string;
}> => {
  try {
    // Check file type
    if (!file.name.endsWith('.json')) {
      return {
        success: false,
        error: 'Please select a valid JSON file',
      };
    }

    // Read file content
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate schema
    if (!isValidAppState(data)) {
      return {
        success: false,
        error: 'Invalid data format. The file does not match the expected schema.',
      };
    }

    // Check schema version
    if (data.version !== SCHEMA_VERSION) {
      return {
        success: false,
        error: `Incompatible schema version. Expected v${SCHEMA_VERSION}, but found v${data.version || 0}.`,
      };
    }

    return {
      success: true,
      state: data,
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Invalid JSON format. Please check the file content.',
      };
    }
    return {
      success: false,
      error: 'Failed to import data. Please try again.',
    };
  }
};

/**
 * Validate uploaded JSON file without importing
 */
export const validateJSONFile = async (file: File): Promise<{
  valid: boolean;
  error?: string;
}> => {
  const result = await importDataFromJSON(file);
  return {
    valid: result.success,
    error: result.error,
  };
};
