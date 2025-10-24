import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Building2, Globe, Mail, Plus, FileSpreadsheet, Play, Sparkles } from "lucide-react";

const ManualLeadEntry = () => {
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [emailId, setEmailId] = useState("");

  const handleAddToNewSheet = () => {
    if (!companyName || !websiteUrl || !emailId) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Added to new sheet!");
    // Backend functionality to be added later
    clearForm();
  };

  const handleAddToExistingSheet = () => {
    if (!companyName || !websiteUrl || !emailId) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Added to existing sheet!");
    // Backend functionality to be added later
    clearForm();
  };

  const handleStartScraping = () => {
    if (!companyName || !websiteUrl || !emailId) {
      toast.error("Please fill all fields");
      return;
    }
    toast.info("Starting scraping process...");
    // Backend functionality to be added later
    clearForm();
  };

  const handleGenerateEmail = () => {
    if (!companyName || !websiteUrl || !emailId) {
      toast.error("Please fill all fields");
      return;
    }
    toast.info("Generating email...");
    // Backend functionality to be added later
    clearForm();
  };

  const clearForm = () => {
    setCompanyName("");
    setWebsiteUrl("");
    setEmailId("");
  };

  return (
    <Card className="h-full">
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="h-5 w-5" />
          Add Lead Manually
        </CardTitle>
        <CardDescription>
          Enter lead details to add them directly or start processing
        </CardDescription>
        
        <TooltipProvider>
          <div className="absolute top-6 right-6 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleAddToNewSheet}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="text-xs">
                <p>Add to New Sheet</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleAddToExistingSheet}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="text-xs">
                <p>Add to Existing Sheet</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="companyName"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="websiteUrl"
              type="url"
              placeholder="Website URL"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="emailId"
              type="email"
              placeholder="Email ID"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleStartScraping}
            className="w-full h-12"
            variant="default"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Scraping
          </Button>
          
          <Button
            onClick={handleGenerateEmail}
            className="w-full h-12"
            variant="secondary"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualLeadEntry;
