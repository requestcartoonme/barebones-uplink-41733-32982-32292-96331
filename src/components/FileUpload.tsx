import { useState, useRef } from "react";
import { toast } from "sonner";
import FileUploadCard from "@/components/FileUploadCard";
import FileUploadDataSections from "@/components/FileUploadDataSections";
import ManualLeadEntry from "@/components/ManualLeadEntry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WebhookResponse {
  companyName: string;
  websiteUrl: string;
  scrappingStatus: string;
  timestamp: string;
  scrappedData?: string;
  generatedEmail?: string;
}

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [webhookResponses, setWebhookResponses] = useState<WebhookResponse[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [queueResultsState, setQueueResults] = useState<WebhookResponse[]>([]);
  const [isFetchingResults, setIsFetchingResults] = useState(false);

  // State for modal dialog
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueSearchQuery, setQueueSearchQuery] = useState("");
  const [isUploadedDataOpen, setIsUploadedDataOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', '.csv'];
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isValidFileType = validTypes.includes(fileType) || fileName.endsWith('.csv');
      
      if (!isValidFileType) {
        toast.error("Please select a valid CSV file");
        return;
      }
      
      // Validate file size (e.g., max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    // Additional validation before upload
    if (selectedFile.size === 0) {
      toast.error("Selected file is empty");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    toast.success(`Uploading ${selectedFile.name}...`);
    
    const webhookUrl = "https://fun-driven-ape.ngrok-free.app/webhook-test/77738df2-cc89-4e44-9aea-2c0175b37faf";
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      formData.append('filename', selectedFile.name);
      formData.append('contentType', selectedFile.type || 'text/csv');
      formData.append('fileSize', selectedFile.size.toString());
      formData.append('timestamp', new Date().toISOString());
      
      // Add debugging information
      console.log('File to upload:', selectedFile);
      console.log('File size:', selectedFile.size);
      console.log('File type:', selectedFile.type);
      console.log('Form data entries:', Array.from(formData.entries()));
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev >= 90 ? 90 : prev + Math.random() * 10 + 5);
      }, 150);
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        // Remove the ngrok-skip-browser-warning header which might interfere
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        if (Array.isArray(responseData)) {
          const newResponses: WebhookResponse[] = responseData.map(item => ({
            companyName: item.Company || item.company || 'N/A',
            websiteUrl: item['Website Base URL'] || item.websiteUrl || 'N/A',
            scrappingStatus: item.Status || item.status || 'N/A',
            timestamp: new Date().toISOString()
          }));
          
          setWebhookResponses(prev => [...newResponses, ...prev]);
          toast.success(`File processed! Added ${newResponses.length} entries`);
          setIsUploadedDataOpen(true);
        } else {
          console.warn('Response data is not an array:', responseData);
          toast.success(`File uploaded successfully`);
        }
      } else {
        // Handle non-OK responses
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status, 'Response:', errorText);
        toast.error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 500);
      
    } catch (error) {
      console.error("Error:", error);
      setIsUploading(false);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleRowSelection = (index: number) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      newSelected.has(index) ? newSelected.delete(index) : newSelected.add(index);
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    setSelectedRows(selectedRows.size === webhookResponses.length ? new Set() : new Set(webhookResponses.map((_, i) => i)));
  };

  const [selectedQueueRows, setSelectedQueueRows] = useState<Set<number>>(new Set());




  const toggleQueueRowSelection = (index: number) => {
    setSelectedQueueRows(prev => {
      const newSelected = new Set(prev);
      newSelected.has(index) ? newSelected.delete(index) : newSelected.add(index);
      return newSelected;
    });
  };

  const toggleQueueSelectAll = () => {
    setSelectedQueueRows(selectedQueueRows.size === queueResultsState.length ? new Set() : new Set(queueResultsState.map((_, i) => i)));
  };

  const handleAddToScrapeQueue = async () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one row");
      return;
    }

    const selectedItems = Array.from(selectedRows).map(index => webhookResponses[index]);
    console.log("Adding to queue:", selectedItems);

    const webhookUrl = "https://fun-driven-ape.ngrok-free.app/webhook-test/630480aa-3ca2-42df-b067-b2fdbbf79d9a";

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(selectedItems),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newQueueItems: WebhookResponse[] = responseData.map((item: any) => ({
          companyName: item.Company || 'N/A',
          websiteUrl: item["Website Base URL"] || 'N/A',
          scrappingStatus: item.Status || 'Scrap Pending',
          timestamp: new Date().toISOString(),
          scrappedData: item.scrappedData || 'N/A',
          generatedEmail: item.generatedEmail || 'N/A',
        }));
        setQueueResults(prev => [...newQueueItems, ...prev]);
        toast.success(`Added ${selectedRows.size} items to queue and received webhook response.`);
        setSelectedRows(new Set());
      } else {
        toast.error("Failed to send data to webhook.");
      }
    } catch (error) {
      console.error("Error sending data to webhook:", error);
      toast.error("Error sending data to webhook.");
    }
  };

  const handleStartScrapping = async () => {
    if (selectedQueueRows.size === 0) {
      toast.error("Please select at least one row");
      return;
    }

    const selectedData = Array.from(selectedQueueRows).map(index => queueResultsState[index]);

    try {
      const response = await fetch('https://fun-driven-ape.ngrok-free.app/webhook-test/ee55dfb5-5d4d-45e3-bdb8-254662b30e63', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Webhook response:", responseData);
      
      // Map the webhook response to the expected format and update queue results
      const updatedQueueResults = queueResultsState.map((item, index) => {
        if (selectedQueueRows.has(index)) {
          // Find the corresponding response for this item
          const responseItem = responseData.find((resp: any) => 
            resp.Company === item.companyName || 
            resp["Website Base URL"] === item.websiteUrl
          );
          
          if (responseItem) {
            return {
              ...item,
              scrappingStatus: responseItem.Status || 'Scrap Done',
              scrappedData: responseItem.Data || 'N/A',
              timestamp: new Date().toISOString()
            };
          }
        }
        return item;
      });
      
      setQueueResults(updatedQueueResults);
      toast.success("Scraping completed successfully! Data has been updated.");
      
    } catch (error) {
      console.error("Error sending data to webhook:", error);
      toast.error("Failed to send data to webhook.");
    }
  };

  const handleGenerateEmail = () => {
    // Implementation for email generation
    console.log("Generating email templates");
    toast.success("Email templates generated successfully");
  };

  const fetchScrapedResults = async () => {
    // Implementation for fetching results
    console.log("Fetching latest scraping results");
    toast.success("Results refreshed successfully");
  };

  const handleViewContent = (content: string, title: string) => {
    setModalContent(content);
    setModalTitle(title);
    setIsContentModalOpen(true);
  };

  const isAllSelected = selectedRows.size === webhookResponses.length && webhookResponses.length > 0;
  const isAllQueueSelected = selectedQueueRows.size === queueResultsState.length && queueResultsState.length > 0;

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploadCard
          selectedFile={selectedFile}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onFileSelect={handleFileSelect}
          onUploadClick={handleUploadClick}
          onUpload={handleUpload}
          fileInputRef={fileInputRef}
        />
        <ManualLeadEntry />
      </div>

      <FileUploadDataSections
        webhookResponses={webhookResponses}
        selectedRows={selectedRows}
        isUploadedDataOpen={isUploadedDataOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsUploadedDataOpen={setIsUploadedDataOpen}
        toggleSelectAll={toggleSelectAll}
        toggleRowSelection={toggleRowSelection}
        handleAddToScrapeQueue={handleAddToScrapeQueue}
        isAllSelected={isAllSelected}
        queueResults={queueResultsState}
        selectedQueueRows={selectedQueueRows}
        isQueueOpen={isQueueOpen}
        queueSearchQuery={queueSearchQuery}
        statusFilter={statusFilter}
        isFetchingResults={isFetchingResults}
        setQueueSearchQuery={setQueueSearchQuery}
        setStatusFilter={setStatusFilter}
        setIsQueueOpen={setIsQueueOpen}
        toggleQueueSelectAll={toggleQueueSelectAll}
        toggleQueueRowSelection={toggleQueueRowSelection}
        handleStartScrapping={handleStartScrapping}
        handleGenerateEmail={handleGenerateEmail}
        fetchScrapedResults={fetchScrapedResults}
        handleViewContent={handleViewContent}
        isAllQueueSelected={isAllQueueSelected}
      />

      {/* Modal Dialog for Viewing Content */}
      <Dialog open={isContentModalOpen} onOpenChange={setIsContentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <DialogDescription asChild>
              <div className="bg-muted/50 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap break-words text-sm">
                  {modalContent}
                </pre>
              </div>
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUpload;
