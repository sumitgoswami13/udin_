import { api, ApiResponse } from '../../utils/api';

export const documentApi = {
  uploadDocument: (formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse> =>
    api.upload('/documents/upload', formData, onProgress),

  getUserDocuments: (filters: {
    status?: string;
    category?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return api.get(`/documents?${params.toString()}`);
  },

  getDocumentById: (documentId: string) =>
    api.get(`/documents/${documentId}`),

  deleteDocument: (documentId: string) =>
    api.delete(`/documents/${documentId}`),

  downloadDocument: (documentId: string) => {
    // Handle file download separately
    const token = store.getState().auth.accessToken;
    const url = `/api/documents/${documentId}/download`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.style.display = 'none';
    
    if (token) {
      link.setAttribute('data-token', token);
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return Promise.resolve({ success: true, message: 'Download initiated' });
  },

  // Admin APIs
  getAdminDocuments: (filters: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return api.get(`/documents/admin/all?${params.toString()}`);
  },

  updateDocumentStatus: (documentId: string, data: {
    status: string;
    notes?: string;
  }) => api.patch(`/documents/admin/${documentId}/status`, data),

  uploadSignedDocument: (documentId: string, formData: FormData) =>
    api.upload(`/documents/admin/${documentId}/signed`, formData),
};