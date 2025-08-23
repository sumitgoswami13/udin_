import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  Upload as UploadIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Tag,
  Calculator,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOCUMENT_TYPES, PricingCalculator } from "@shared/pricing";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "completed" | "error";
  progress: number;
  documentTypeId: string;
  tier: string;
}

export default function Upload() {
  const navigate = useNavigate();
  const { upload, isUploading, uploadProgress, error, clearDocumentError } = useDocuments();
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCostPopup, setShowCostPopup] = useState(false);

  // Handle upload errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive",
      });
      clearDocumentError();
    }
  }, [error, toast, clearDocumentError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
      }
    },
    [],
  );

  const processFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > 30) {
      toast({
        title: "Upload Limit Exceeded",
        description: "Maximum 30 documents allowed per upload session.",
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const invalidFiles = newFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      return !validTypes.includes(file.type) || file.size > maxSize;
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid Files",
        description: "Some files are invalid. Please check file types and sizes (max 10MB).",
        variant: "destructive",
      });
      return;
    }

    const uploadFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
      documentTypeId: "",
      tier: "Standard",
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);

    // Upload files to server
    uploadFiles.forEach((file) => {
      uploadFileToServer(file);
    });
  };

  const uploadFileToServer = async (file: UploadedFile) => {
    try {
      // Create File object from UploadedFile
      const fileBlob = new File([new Blob()], file.name, { type: file.type });
      
      const result = await upload({
        file: fileBlob,
        documentTypeId: file.documentTypeId,
        tier: file.tier,
      });

      if (result.meta.requestStatus === 'fulfilled') {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ));
      } else {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileDocumentType = (id: string, documentTypeId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, documentTypeId } : f)),
    );
  };

  const documentCategories = PricingCalculator.getDocumentCategories();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const calculateCost = () => {
    const items = files
      .filter((f) => f.documentTypeId)
      .map((f) => ({
        documentTypeId: f.documentTypeId,
        tier: f.tier,
        quantity: 1,
      }));

    if (items.length === 0) {
      return {
        subtotal: 0,
        bulkDiscount: 0,
        gstAmount: 0,
        totalAmount: 0,
        breakdown: [],
        documentCount: 0,
      };
    }

    const calculation = PricingCalculator.calculateOrderTotal(items);
    return {
      ...calculation,
      documentCount: files.length,
    };
  };

  const handleContinue = () => {
    if (files.length > 0) {
      const incompleteFiles = files.filter(f => !f.documentTypeId);
      if (incompleteFiles.length > 0) {
        toast({
          title: "Incomplete Selection",
          description: "Please select document type for all files.",
          variant: "destructive",
        });
        return;
      }
      setShowCostPopup(true);
    }
  };

  const handleProceedToRegistration = () => {
    setShowCostPopup(false);
    if (user) {
      navigate("/payment");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">UDIN</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Signup
              </Button>
            </nav>

            {/* Tablet Navigation */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Signup
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
                className="text-xs px-2"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              UDIN Professional Services
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Upload your documents for professional chartered accountant
              services with UDIN certification and compliance
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload your documents for professional CA services including
                audit, certification, compliance, and taxation with UDIN
                support. Supported formats: PDF, DOC, DOCX, TXT, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 text-gray-400 mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium mb-2">
                  Drag and drop your files here
                </p>
                <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileSelect}
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      Uploaded Files ({files.length}/30)
                    </h3>
                    <Badge variant="outline">
                      {files.filter((f) => f.status === "completed").length}{" "}
                      completed
                    </Badge>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-3 p-4 border rounded-lg bg-white"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {formatFileSize(file.size)}
                          </p>
                          {file.status === "uploading" && (
                            <Progress
                              value={file.progress}
                              className="mb-2 h-1"
                            />
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3 text-gray-400" />
                              <Select
                                value={file.documentTypeId}
                                onValueChange={(value) =>
                                  updateFileDocumentType(file.id, value)
                                }
                              >
                                <SelectTrigger className="w-48 h-7 text-xs">
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {documentCategories.map((category) => (
                                    <div key={category.id}>
                                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                                        {category.name}
                                      </div>
                                      {DOCUMENT_TYPES.filter(
                                        (dt) => dt.category === category.id,
                                      ).map((docType) => (
                                        <SelectItem
                                          key={docType.id}
                                          value={docType.id}
                                          className="pl-4"
                                        >
                                          {docType.name} - ₹{docType.basePrice}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {files.length > 0 && (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={
                  files.some((f) => f.status === "uploading") ||
                  files.some((f) => f.documentTypeId === "")
                }
                className="px-8"
              >
                Continue to Registration
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                {files.some((f) => f.documentTypeId === "")
                  ? "Please select a document type for all files to continue"
                  : "Next: Create an account to track your documents"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cost Calculation Popup */}
      <Dialog open={showCostPopup} onOpenChange={setShowCostPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cost Breakdown
            </DialogTitle>
            <DialogDescription>
              Review the total cost for processing your documents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {/* Document breakdown */}
              {calculateCost().breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {item.documentType} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Documents Subtotal
                  </span>
                  <span className="font-medium">
                    ₹{calculateCost().subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {calculateCost().bulkDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm">Bulk Discount (5+ services)</span>
                  <span className="font-medium">
                    -₹{calculateCost().bulkDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GST (18%)</span>
                <span className="font-medium">
                  ₹{calculateCost().gstAmount.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-primary">
                    ₹{calculateCost().totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Payment will be collected during the registration process.
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCostPopup(false)}>
              Cancel
            </Button>
            <Button onClick={handleProceedToRegistration}>
              Continue to Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
