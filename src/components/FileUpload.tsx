import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, CheckCircle, FileText, Filter, Search, ChevronDown, Mail } from "lucide-react";
import { toast } from "sonner";

interface WebhookResponse {
  companyName: string;
  websiteUrl: string;
  scrappingStatus: string;
  timestamp: string;
  scrappedData?: string;
}

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [webhookResponses, setWebhookResponses] = useState<WebhookResponse[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [queueResults, setQueueResults] = useState<WebhookResponse[]>([]);
  const [selectedQueueRows, setSelectedQueueRows] = useState<Set<number>>(new Set());
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueSearchQuery, setQueueSearchQuery] = useState("");
  const [isUploadedDataOpen, setIsUploadedDataOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (selectedFile && !isUploading) {
      setIsUploading(true);
      setUploadProgress(0);
      toast.success(`Uploading ${selectedFile.name}...`);
      
      const webhookUrl = "https://fun-driven-ape.ngrok-free.app/webhook-test/77738df2-cc89-4e44-9aea-2c0175b37faf";
      
      try {
        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('timestamp', new Date().toISOString());
        formData.append('triggered_from', window.location.origin);
        formData.append('filename', selectedFile.name);
        formData.append('filesize', selectedFile.size.toString());
        
        // Simulate progressive upload with actual request
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90; // Hold at 90% until request completes
            }
            return prev + Math.random() * 10 + 5;
          });
        }, 150);
        
        console.log("Sending file to webhook:", webhookUrl);
        
        const response = await fetch(webhookUrl, {
          method: "POST",
          body: formData,
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        // Complete the progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (response.ok) {
          const responseData = await response.json();
          
          // Handle array response from webhook
          if (Array.isArray(responseData)) {
            const newResponses: WebhookResponse[] = responseData.map(item => ({
              companyName: item.Company || item.company || 'N/A',
              websiteUrl: item['Website Base URL'] || item.websiteUrl || 'N/A',
              scrappingStatus: item.Status || item.status || 'N/A',
              timestamp: new Date().toISOString()
            }));
            
            setWebhookResponses(prev => [...newResponses, ...prev]);
            toast.success(`File processed! Added ${newResponses.length} entries`);
          } else {
            // Handle single object response (fallback)
            const newResponse: WebhookResponse = {
              companyName: responseData.Company || responseData.company || 'N/A',
              websiteUrl: responseData['Website Base URL'] || responseData.websiteUrl || 'N/A',
              scrappingStatus: responseData.Status || responseData.status || 'N/A',
              timestamp: new Date().toISOString()
            };
            
            setWebhookResponses(prev => [newResponse, ...prev]);
            toast.success(`File processed! Company: ${newResponse.companyName}`);
          }
        } else {
          toast.error(`Webhook returned ${response.status}: ${response.statusText}`);
        }
        
        setTimeout(() => {
          setIsUploading(false);
          setSelectedFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 500);
        
      } catch (error) {
        console.error("Error sending file to webhook:", error);
        setIsUploading(false);
        setUploadProgress(0);
        toast.error("Failed to send file to webhook. Please try again.");
      }
    } else if (!selectedFile) {
      toast.error("Please select a file first");
    }
  };

  const toggleRowSelection = (index: number) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === webhookResponses.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(webhookResponses.map((_, index) => index)));
    }
  };

  const isAllSelected = selectedRows.size === webhookResponses.length && webhookResponses.length > 0;

  const toggleQueueRowSelection = (index: number) => {
    setSelectedQueueRows(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  const toggleQueueSelectAll = () => {
    if (selectedQueueRows.size === filteredQueueResults.length) {
      setSelectedQueueRows(new Set());
    } else {
      // Get original indices for filtered results
      const filteredIndices = filteredQueueResults.map(result => queueResults.indexOf(result));
      setSelectedQueueRows(new Set(filteredIndices));
    }
  };

  const isAllQueueSelected = selectedQueueRows.size === queueResults.length && queueResults.length > 0;

  // Filter queue results based on status and search
  const filteredQueueResults = queueResults
    .filter(result => statusFilter === "all" || result.scrappingStatus === statusFilter)
    .filter(result => 
      queueSearchQuery === "" || 
      result.companyName.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      result.websiteUrl.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      result.scrappingStatus.toLowerCase().includes(queueSearchQuery.toLowerCase())
    );

  // Filter uploaded data based on search
  const filteredUploadedData = webhookResponses.filter(response =>
    searchQuery === "" ||
    response.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.scrappingStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchQueueResults = async () => {
    const queueWebhookUrl = "https://fun-driven-ape.ngrok-free.app/webhook-test/630480aa-3ca2-42df-b067-b2fdbbf79d9a";
    
    try {
      setIsFetchingResults(true);
      toast.info("Fetching scrape queue results...");
      
      const response = await fetch(queueWebhookUrl, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Handle array response
        if (Array.isArray(responseData)) {
          const results: WebhookResponse[] = responseData.map(item => ({
            companyName: item.companyName || item.Company || item.company || 'N/A',
            websiteUrl: item.websiteUrl || item['Website Base URL'] || 'N/A',
            scrappingStatus: item.scrappingStatus || item.Status || item.status || 'N/A',
            timestamp: item.timestamp || new Date().toISOString()
          }));
          
          setQueueResults(results);
          toast.success(`Fetched ${results.length} results from scrape queue`);
        } else {
          setQueueResults([]);
          toast.info("No results available yet");
        }
      } else {
        toast.error(`Failed to fetch results: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching queue results:", error);
      toast.error("Failed to fetch scrape queue results");
    } finally {
      setIsFetchingResults(false);
    }
  };

  const handleAddToScrapeQueue = async () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one row");
      return;
    }

    const selectedData = Array.from(selectedRows).map(index => webhookResponses[index]);
    const queueWebhookUrl = "https://fun-driven-ape.ngrok-free.app/webhook-test/630480aa-3ca2-42df-b067-b2fdbbf79d9a";

    try {
      toast.info(`Adding ${selectedData.length} ${selectedData.length === 1 ? 'item' : 'items'} to scrape queue...`);
      
      const response = await fetch(queueWebhookUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(selectedData)
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success(`Successfully added ${selectedData.length} ${selectedData.length === 1 ? 'item' : 'items'} to scrape queue`);
        
        // Display the response data from the webhook
        if (Array.isArray(responseData)) {
          const results: WebhookResponse[] = responseData.map(item => ({
            companyName: item.companyName || item.Company || item.company || 'N/A',
            websiteUrl: item.websiteUrl || item['Website Base URL'] || 'N/A',
            scrappingStatus: item.scrappingStatus || item.Status || item.status || 'N/A',
            timestamp: item.timestamp || new Date().toISOString()
          }));
          setQueueResults(results);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          const results: WebhookResponse[] = responseData.data.map(item => ({
            companyName: item.companyName || item.Company || item.company || 'N/A',
            websiteUrl: item.websiteUrl || item['Website Base URL'] || 'N/A',
            scrappingStatus: item.scrappingStatus || item.Status || item.status || 'N/A',
            timestamp: item.timestamp || new Date().toISOString()
          }));
          setQueueResults(results);
        }
        
        setSelectedRows(new Set()); // Clear selection after successful send
      } else {
        toast.error(`Failed to add to queue: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending to queue webhook:", error);
      toast.error("Failed to add to scrape queue. Please try again.");
    }
  };

  const handleStartScrapping = async () => {
    if (selectedQueueRows.size === 0) {
      toast.error("Please select at least one row to scrape");
      return;
    }

    const selectedData = Array.from(selectedQueueRows).map(index => queueResults[index]);
    const startScrappingUrl = "https://fun-driven-ape.ngrok-free.app/webhook-test/ee55dfb5-5d4d-45e3-bdb8-254662b30e63";

    try {
      toast.info(`Starting scraping process for ${selectedData.length} ${selectedData.length === 1 ? 'item' : 'items'}...`);
      
      const response = await fetch(startScrappingUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(selectedData)
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success("Scraping process started successfully!");
        console.log("Start scrapping response:", responseData);
        
        // Update results directly from POST response
        if (Array.isArray(responseData)) {
          const results: WebhookResponse[] = responseData.map(item => ({
            companyName: item.companyName || item.Company || item.company || 'N/A',
            websiteUrl: item.websiteUrl || item['Website Base URL'] || 'N/A',
            scrappingStatus: item.scrappingStatus || item.Status || item.status || 'N/A',
            timestamp: item.timestamp || new Date().toISOString(),
            scrappedData: item.scrappedData || item.Data || item.data || 'N/A'
          }));
          setQueueResults(results);
          setSelectedQueueRows(new Set()); // Clear selection after scraping
          toast.success(`Updated ${results.length} results with scraping status`);
        }
      } else {
        toast.error(`Failed to start scraping: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error starting scraping:", error);
      toast.error("Failed to start scraping. Please try again.");
    }
  };

  const fetchScrapedResults = async () => {
    const scrappingResultsUrlTest = "https://fun-driven-ape.ngrok-free.app/webhook-test/8cdc7d4d-d041-4878-bac8-4d94604079bc";
    const scrappingResultsUrlProd = scrappingResultsUrlTest.replace("/webhook-test/", "/webhook/");
    
    try {
      setIsFetchingResults(true);
      toast.info("Refreshing scraped data...");
      
      const commonOptions: RequestInit = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(queueResults?.length ? queueResults : {})
      };

      // Try test URL first (works when the n8n workflow is in test/execute mode)
      let response = await fetch(scrappingResultsUrlTest, commonOptions);

      // If test URL is not available (e.g., 404), try the production URL
      if (!response.ok) {
        console.warn(`Fetch to test webhook failed: ${response.status} ${response.statusText}. Retrying production URL...`);
        response = await fetch(scrappingResultsUrlProd, commonOptions);
      }

      if (response.ok) {
        const responseData = await response.json();
        
        if (Array.isArray(responseData)) {
          const results: WebhookResponse[] = responseData.map(item => ({
            companyName: item.companyName || item.Company || item.company || 'N/A',
            websiteUrl: item.websiteUrl || item['Website Base URL'] || 'N/A',
            scrappingStatus: item.scrappingStatus || item.Status || item.status || 'N/A',
            timestamp: item.timestamp || new Date().toISOString(),
            scrappedData: item.scrappedData || item.Data || item.data || 'N/A'
          }));
          
          setQueueResults(results);
          toast.success(`Refreshed ${results.length} results with scraped data`);
        } else {
          toast.info("No results available yet");
        }
      } else {
        toast.error(`Failed to fetch results: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching scraped results:", error);
      toast.error("Failed to fetch scraped data");
    } finally {
      setIsFetchingResults(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upload File</h3>
        <div 
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isUploading 
              ? "border-primary bg-upload-focus cursor-default" 
              : "border-upload-border bg-upload-background hover:border-primary hover:bg-upload-hover cursor-pointer"
          } group`}
        >
          {!isUploading && (
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="*/*"
            />
          )}
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {isUploading && uploadProgress === 100 ? (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                  <Upload className={`h-8 w-8 transition-colors ${
                    isUploading 
                      ? "text-primary animate-pulse" 
                      : "text-muted-foreground group-hover:text-primary"
                  }`} />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {isUploading 
                  ? (uploadProgress === 100 ? "Upload Complete!" : `Uploading ${selectedFile?.name}...`)
                  : (selectedFile ? selectedFile.name : "Drag & drop or click to upload")
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {isUploading
                  ? `${Math.round(uploadProgress)}% complete`
                  : selectedFile 
                    ? `${Math.round(selectedFile.size / 1024)} KB` 
                    : "Supports all file types"
                }
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6">
              <Progress 
                value={uploadProgress} 
                className="w-full h-2"
              />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button 
          onClick={selectedFile ? handleUpload : handleUploadClick}
          disabled={isUploading}
          className="w-full h-12 text-base font-semibold transition-all duration-200 mt-6"
          size="lg"
        >
          {isUploading 
            ? (uploadProgress === 100 ? "Completing..." : "Uploading...")
            : (selectedFile ? "Upload File" : "Select File")
          }
        </Button>
      </div>

      {/* Uploaded Data Section */}
      <Collapsible open={isUploadedDataOpen} onOpenChange={setIsUploadedDataOpen} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4 flex-1">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isUploadedDataOpen ? '' : '-rotate-90'}`} />
              <h3 className="text-lg font-semibold text-foreground">Uploaded Data</h3>
            </CollapsibleTrigger>
            <div className="relative ml-auto mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-[200px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {selectedRows.size} of {webhookResponses.length} selected
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              disabled={webhookResponses.length === 0}
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </Button>
            <Button
              size="sm"
              onClick={handleAddToScrapeQueue}
              disabled={selectedRows.size === 0}
            >
              Add to Queue
            </Button>
          </div>
        </div>
        <CollapsibleContent>
          <ScrollArea className="h-[400px]">
            {webhookResponses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">No data uploaded</p>
                    <p className="text-sm text-muted-foreground">Upload a file to see your data here</p>
                  </div>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Company Name</TableHead>
                    <TableHead className="font-semibold">Website URL</TableHead>
                    <TableHead className="font-semibold">Scrapping Status</TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUploadedData.map((response, index) => {
                    const originalIndex = webhookResponses.indexOf(response);
                    return (
                      <TableRow key={originalIndex} className={selectedRows.has(originalIndex) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(originalIndex)}
                            onCheckedChange={() => toggleRowSelection(originalIndex)}
                            aria-label={`Select row ${originalIndex + 1}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{response.companyName}</TableCell>
                        <TableCell>
                          {response.websiteUrl !== 'N/A' ? (
                            <a 
                              href={response.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {response.websiteUrl}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            response.scrappingStatus.toLowerCase() === 'success' || response.scrappingStatus.toLowerCase() === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : response.scrappingStatus.toLowerCase() === 'failed' || response.scrappingStatus.toLowerCase() === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {response.scrappingStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(response.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Scrape Queue Results Section */}
      <Collapsible open={isQueueOpen} onOpenChange={setIsQueueOpen} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4 flex-1">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isQueueOpen ? '' : '-rotate-90'}`} />
              <h3 className="text-lg font-semibold text-foreground">Scrape Queue</h3>
            </CollapsibleTrigger>
            <div className="relative ml-auto mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={queueSearchQuery}
                onChange={(e) => setQueueSearchQuery(e.target.value)}
                className="pl-9 h-9 w-[200px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {selectedQueueRows.size} of {queueResults.length} selected
              {statusFilter !== "all" && ` • Filtered: ${filteredQueueResults.length} items`}
            </p>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Scrap Pending">Scrap Pending</SelectItem>
                  <SelectItem value="Begin Scrapping">Begin Scrapping</SelectItem>
                  <SelectItem value="Scrap Done">Scrap Done</SelectItem>
                  <SelectItem value="Email Drafted">Email Drafted</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleQueueSelectAll}
              disabled={filteredQueueResults.length === 0}
            >
              {isAllQueueSelected ? "Deselect All" : "Select All"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchScrapedResults}
              disabled={isFetchingResults}
            >
              {isFetchingResults ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              size="sm"
              onClick={handleStartScrapping}
              disabled={selectedQueueRows.size === 0}
            >
              Start Scraping
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={selectedQueueRows.size === 0}
            >
              <Mail className="h-4 w-4 mr-2" />
              Generate Email
            </Button>
          </div>
        </div>
        
        <CollapsibleContent>
          <ScrollArea className="h-[400px]">
            {queueResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllQueueSelected}
                        onCheckedChange={toggleQueueSelectAll}
                        aria-label="Select all queue rows"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Company Name</TableHead>
                    <TableHead className="font-semibold">Website URL</TableHead>
                    <TableHead className="font-semibold">Scrapping Status</TableHead>
                    <TableHead className="font-semibold">Scraped Data</TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueueResults.map((result) => {
                    const originalIndex = queueResults.indexOf(result);
                    return (
                      <TableRow key={originalIndex} className={selectedQueueRows.has(originalIndex) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedQueueRows.has(originalIndex)}
                            onCheckedChange={() => toggleQueueRowSelection(originalIndex)}
                            aria-label={`Select queue row ${originalIndex + 1}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{result.companyName}</TableCell>
                        <TableCell>
                          {result.websiteUrl !== 'N/A' ? (
                            <a 
                              href={result.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {result.websiteUrl}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            result.scrappingStatus.toLowerCase().includes('done')
                              ? 'bg-green-500 text-white font-semibold'
                              : result.scrappingStatus.toLowerCase().includes('begin')
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : result.scrappingStatus.toLowerCase().includes('pending')
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : result.scrappingStatus.toLowerCase() === 'success' || result.scrappingStatus.toLowerCase() === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : result.scrappingStatus.toLowerCase() === 'failed' || result.scrappingStatus.toLowerCase() === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {result.scrappingStatus}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={result.scrappedData}>
                          {result.scrappedData || 'N/A'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">No items in queue</p>
                    <p className="text-sm text-muted-foreground">Upload files and add them to the queue to start scraping</p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FileUpload;