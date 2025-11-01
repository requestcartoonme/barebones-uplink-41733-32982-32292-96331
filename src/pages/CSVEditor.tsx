import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { Skeleton } from "@/components/ui/skeleton";

interface CSVData {
  headers: string[];
  rows: string[][];
}

const CSVEditor = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [csvData, setCsvData] = useState<CSVData>({ headers: [], rows: [] });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  const [headerValue, setHeaderValue] = useState("");

  const loadCSV = useCallback(async () => {
    if (!fileId) return;
    
    try {
      const { data: fileData, error: fileError } = await supabase
        .from("uploaded_files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (fileError) throw fileError;

      setFileName(fileData.file_name);
      setFilePath(fileData.file_path);

      const { data: csvBlob, error: downloadError } = await supabase.storage
        .from("csv-uploads")
        .download(fileData.file_path);

      if (downloadError) throw downloadError;

      const text = await csvBlob.text();
      Papa.parse(text, {
        complete: (result) => {
          const headers = result.data[0] as string[];
          const rows = result.data.slice(1) as string[][];
          setCsvData({ headers, rows: rows.filter(row => row.some(cell => cell)) });
          setLoading(false);
        },
        error: (error) => {
          throw error;
        }
      });
    } catch (error: any) {
      toast.error("Failed to load CSV: " + error.message);
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    loadCSV();
  }, [loadCSV]);

  const saveCSV = async () => {
    setSaving(true);
    try {
      const csvContent = Papa.unparse({
        fields: csvData.headers,
        data: csvData.rows
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const file = new File([blob], fileName, { type: "text/csv" });

      const { error: uploadError } = await supabase.storage
        .from("csv-uploads")
        .update(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("uploaded_files")
        .update({ 
          file_name: fileName,
          row_count: csvData.rows.length 
        })
        .eq("id", fileId);

      if (dbError) throw dbError;

      toast.success("CSV saved successfully");
    } catch (error: any) {
      toast.error("Failed to save CSV: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateCell = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setCsvData(prev => {
      const newRows = [...prev.rows];
      newRows[rowIndex] = [...newRows[rowIndex]];
      newRows[rowIndex][colIndex] = value;
      return { ...prev, rows: newRows };
    });
  }, []);

  const updateHeader = useCallback((colIndex: number, value: string) => {
    setCsvData(prev => {
      const newHeaders = [...prev.headers];
      newHeaders[colIndex] = value;
      return { ...prev, headers: newHeaders };
    });
  }, []);

  const addRow = useCallback(() => {
    setCsvData(prev => ({
      ...prev,
      rows: [...prev.rows, Array(prev.headers.length).fill("")]
    }));
    toast.success("Row added");
  }, []);

  const deleteRow = useCallback((rowIndex: number) => {
    setCsvData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== rowIndex)
    }));
    toast.success("Row deleted");
  }, []);

  const addColumn = useCallback(() => {
    setCsvData(prev => ({
      headers: [...prev.headers, `Column ${prev.headers.length + 1}`],
      rows: prev.rows.map(row => [...row, ""])
    }));
    toast.success("Column added");
  }, []);

  const deleteColumn = useCallback((colIndex: number) => {
    setCsvData(prev => ({
      headers: prev.headers.filter((_, i) => i !== colIndex),
      rows: prev.rows.map(row => row.filter((_, i) => i !== colIndex))
    }));
    toast.success("Column deleted");
  }, []);

  const deleteFile = async () => {
    if (!confirm("Are you sure you want to delete this CSV file?")) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("csv-uploads")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("uploaded_files")
        .delete()
        .eq("id", fileId);

      if (dbError) throw dbError;

      toast.success("File deleted successfully");
      navigate("/uploaded-files");
    } catch (error: any) {
      toast.error("Failed to delete file: " + error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/uploaded-files")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="font-semibold"
                  />
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addRow} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
                <Button onClick={addColumn} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
                <Button onClick={deleteFile} variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete File
                </Button>
                <Button onClick={saveCSV} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {csvData.headers.map((header, colIndex) => (
                      <TableHead key={colIndex}>
                        <div className="flex items-center gap-2">
                          {editingHeader === colIndex ? (
                            <Input
                              value={headerValue}
                              onChange={(e) => setHeaderValue(e.target.value)}
                              onBlur={() => {
                                updateHeader(colIndex, headerValue);
                                setEditingHeader(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateHeader(colIndex, headerValue);
                                  setEditingHeader(null);
                                }
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span
                              onClick={() => {
                                setEditingHeader(colIndex);
                                setHeaderValue(header);
                              }}
                              className="cursor-pointer hover:underline"
                            >
                              {header}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteColumn(colIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                      {row.map((cell, colIndex) => (
                        <TableCell key={colIndex}>
                          {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                updateCell(rowIndex, colIndex, editValue);
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateCell(rowIndex, colIndex, editValue);
                                  setEditingCell(null);
                                }
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span
                              onClick={() => {
                                setEditingCell({ row: rowIndex, col: colIndex });
                                setEditValue(cell);
                              }}
                              className="cursor-pointer hover:underline block"
                            >
                              {cell || "-"}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRow(rowIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CSVEditor;
