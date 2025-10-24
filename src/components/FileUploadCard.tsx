import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle } from "lucide-react";

interface FileUploadCardProps {
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const FileUploadCard = ({
  selectedFile,
  isUploading,
  uploadProgress,
  onFileSelect,
  onUploadClick,
  onUpload,
  fileInputRef
}: FileUploadCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-5 w-5" />
          Upload File
        </CardTitle>
        <CardDescription>
          Upload your lead file to start processing
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          accept=".csv"
          className="hidden"
          id="file-input"
        />

        <div
          onClick={() => {
            if (!selectedFile && !isUploading) {
              onUploadClick();
            } else if (selectedFile && !isUploading) {
              onUpload();
            }
          }}
          className={`relative border-2 border-dashed rounded-xl px-4 h-[216px] flex items-center justify-center transition-all duration-200 ${
            isUploading
              ? "border-primary bg-primary-hover cursor-not-allowed"
              : selectedFile
                ? "border-primary bg-accent/50 hover:bg-primary-hover cursor-pointer"
                : "border-border hover:border-primary cursor-pointer"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 text-center">
                  <p className="font-medium text-foreground text-sm">Uploading... {Math.floor(uploadProgress)}%</p>
                  <p className="text-xs text-muted-foreground">{selectedFile?.name}</p>
                </div>
                <Progress value={uploadProgress} className="w-[60%] mt-2" />
              </>
            ) : selectedFile ? (
              <>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-0.5 text-center">
                  <p className="font-medium text-foreground text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <p className="text-xs text-black mt-8">Click again to upload</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="space-y-0.5 text-center">
                  <p className="font-medium text-foreground text-sm">Click to select file</p>
                  <p className="text-xs text-muted-foreground">
                    CSV files supported
                  </p>
                </div>
              </>
            )}
          </div>


        </div>


      </CardContent>
    </Card>
  );
};

export default FileUploadCard;
