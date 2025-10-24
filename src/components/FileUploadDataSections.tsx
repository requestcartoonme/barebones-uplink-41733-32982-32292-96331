import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Filter, Search, ChevronDown, Mail } from "lucide-react";

interface WebhookResponse {
  companyName: string;
  websiteUrl: string;
  scrappingStatus: string;
  timestamp: string;
  scrappedData?: string;
  generatedEmail?: string;
}

interface FileUploadDataSectionsProps {
  // Uploaded Data props
  webhookResponses: WebhookResponse[];
  selectedRows: Set<number>;
  isUploadedDataOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsUploadedDataOpen: (open: boolean) => void;
  toggleSelectAll: () => void;
  toggleRowSelection: (index: number) => void;
  handleAddToScrapeQueue: () => void;
  isAllSelected: boolean;
  
  // Queue props
  queueResults: WebhookResponse[];
  selectedQueueRows: Set<number>;
  isQueueOpen: boolean;
  queueSearchQuery: string;
  statusFilter: string;
  isFetchingResults: boolean;
  setQueueSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setIsQueueOpen: (open: boolean) => void;
  toggleQueueSelectAll: () => void;
  toggleQueueRowSelection: (index: number) => void;
  handleStartScrapping: () => void;
  handleGenerateEmail: () => void;
  fetchScrapedResults: () => void;
  handleViewContent: (content: string, title: string) => void;
  isAllQueueSelected: boolean;
}

const FileUploadDataSections = (props: FileUploadDataSectionsProps) => {
  const {
    webhookResponses,
    selectedRows,
    isUploadedDataOpen,
    searchQuery,
    setSearchQuery,
    setIsUploadedDataOpen,
    toggleSelectAll,
    toggleRowSelection,
    handleAddToScrapeQueue,
    isAllSelected,
    queueResults,
    selectedQueueRows,
    isQueueOpen,
    queueSearchQuery,
    statusFilter,
    isFetchingResults,
    setQueueSearchQuery,
    setStatusFilter,
    setIsQueueOpen,
    toggleQueueSelectAll,
    toggleQueueRowSelection,
    handleStartScrapping,
    handleGenerateEmail,
    fetchScrapedResults,
    handleViewContent,
    isAllQueueSelected
  } = props;

  // Filter uploaded data based on search
  const filteredUploadedData = webhookResponses.filter(response =>
    searchQuery === "" ||
    response.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.scrappingStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter queue results based on status and search
  const filteredQueueResults = queueResults
    .filter(result => statusFilter === "all" || result.scrappingStatus === statusFilter)
    .filter(result => 
      queueSearchQuery === "" || 
      result.companyName.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      result.websiteUrl.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      result.scrappingStatus.toLowerCase().includes(queueSearchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Uploaded Data Section */}
      <Collapsible open={isUploadedDataOpen} onOpenChange={setIsUploadedDataOpen} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4 flex-1">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isUploadedDataOpen ? '' : '-rotate-90'}`} />
              <h3 className="text-xl font-semibold text-foreground">Uploaded Data</h3>
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
              <h3 className="text-xl font-semibold text-foreground">Scrape Queue</h3>
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
              onClick={handleGenerateEmail}
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
                    <TableHead className="font-semibold">Generated Email</TableHead>
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
                              : result.scrappingStatus.toLowerCase().includes('drafted')
                              ? 'bg-primary text-primary-foreground font-semibold'
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
                        <TableCell 
                          className="max-w-xs truncate cursor-pointer hover:bg-muted/50 transition-colors" 
                          onClick={() => result.scrappedData && result.scrappedData !== 'N/A' && handleViewContent(result.scrappedData, `Scraped Data - ${result.companyName}`)}
                        >
                          {result.scrappedData || 'N/A'}
                        </TableCell>
                        <TableCell 
                          className="max-w-md truncate cursor-pointer hover:bg-muted/50 transition-colors" 
                          onClick={() => result.generatedEmail && result.generatedEmail !== 'N/A' && handleViewContent(result.generatedEmail, `Generated Email - ${result.companyName}`)}
                        >
                          {result.generatedEmail || 'N/A'}
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

export default FileUploadDataSections;
