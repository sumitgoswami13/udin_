import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { documentApi } from '../api/documentApi';

interface Document {
  id: string;
  name: string;
  originalName: string;
  size: number;
  documentType: string;
  category: string;
  tier: string;
  status: string;
  paymentStatus: string;
  cost: number;
  downloadedByAdmin: boolean;
  adminDownloadDate?: string;
  signedDocumentPath?: string;
  signedDocumentUploadDate?: string;
  udinNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    status: string;
    category: string;
    paymentStatus: string;
    search: string;
  };
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    status: 'all',
    category: 'all',
    paymentStatus: 'all',
    search: '',
  },
};

// Async thunks
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (data: {
    file: File;
    documentTypeId: string;
    tier: string;
  }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('document', data.file);
      formData.append('documentTypeId', data.documentTypeId);
      formData.append('tier', data.tier);

      const response = await documentApi.uploadDocument(formData, (progress) => {
        dispatch(setUploadProgress(progress));
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const fetchUserDocuments = createAsyncThunk(
  'documents/fetchUserDocuments',
  async (filters: {
    status?: string;
    category?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await documentApi.getUserDocuments(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchById',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await documentApi.getDocumentById(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (documentId: string, { rejectWithValue }) => {
    try {
      await documentApi.deleteDocument(documentId);
      return documentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DocumentState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUpload: (state) => {
      state.isUploading = false;
      state.uploadProgress = 0;
    },
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Upload Document
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.documents.unshift(action.payload.document);
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });

    // Fetch User Documents
    builder
      .addCase(fetchUserDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.documents;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUserDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Document By ID
    builder
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocument = action.payload.document;
        state.error = null;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Document
    builder
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setFilters, 
  clearError, 
  setUploadProgress, 
  resetUpload, 
  setCurrentDocument 
} = documentSlice.actions;

export default documentSlice.reducer;