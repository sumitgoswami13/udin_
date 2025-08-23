import apiClient from './authApi';

export const documentApi = {
  uploadDocument: (formData: FormData) =>
    apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

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
    
    return apiClient.get(`/documents?${params.toString()}`);
  },

  getDocumentById: (documentId: string) =>
    apiClient.get(`/documents/${documentId}`),

  deleteDocument: (documentId: string) =>
    apiClient.delete(`/documents/${documentId}`),

  downloadDocument: (documentId: string) =>
    apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    }),

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
    
    return apiClient.get(`/documents/admin/all?${params.toString()}`);
  },

  updateDocumentStatus: (documentId: string, data: {
    status: string;
    notes?: string;
  }) => apiClient.patch(`/documents/admin/${documentId}/status`, data),

  uploadSignedDocument: (documentId: string, formData: FormData) =>
    apiClient.post(`/documents/admin/${documentId}/signed`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};