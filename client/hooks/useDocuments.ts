import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { 
  uploadDocument,
  fetchUserDocuments,
  fetchDocumentById,
  deleteDocument,
  setFilters,
  clearError,
  setCurrentDocument,
  resetUpload
} from '../store/slices/documentSlice';

export const useDocuments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const documentState = useSelector((state: RootState) => state.documents);

  const upload = useCallback(
    (data: {
      file: File;
      documentTypeId: string;
      tier: string;
    }) => {
      return dispatch(uploadDocument(data));
    },
    [dispatch]
  );

  const fetchDocuments = useCallback(
    (filters?: {
      status?: string;
      category?: string;
      paymentStatus?: string;
      page?: number;
      limit?: number;
    }) => {
      return dispatch(fetchUserDocuments(filters || {}));
    },
    [dispatch]
  );

  const fetchDocument = useCallback(
    (documentId: string) => {
      return dispatch(fetchDocumentById(documentId));
    },
    [dispatch]
  );

  const removeDocument = useCallback(
    (documentId: string) => {
      return dispatch(deleteDocument(documentId));
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (filters: Partial<typeof documentState.filters>) => {
      dispatch(setFilters(filters));
    },
    [dispatch]
  );

  const clearDocumentError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const selectDocument = useCallback(
    (document: any) => {
      dispatch(setCurrentDocument(document));
    },
    [dispatch]
  );

  const resetUploadState = useCallback(() => {
    dispatch(resetUpload());
  }, [dispatch]);

  return {
    ...documentState,
    upload,
    fetchDocuments,
    fetchDocument,
    removeDocument,
    updateFilters,
    clearDocumentError,
    selectDocument,
    resetUploadState,
  };
};