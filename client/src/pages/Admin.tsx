import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { useUploadTally } from "@/hooks/use-admin";
import { motion } from "framer-motion";

export default function Admin() {
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadTally();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold mb-2">Admin Import</h1>
            <p className="text-muted-foreground">Upload Tally Export (XML/Excel) to update ledger.</p>
          </div>

          <Card className="border-2 border-dashed border-slate-200 shadow-xl rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className={`
                  w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300
                  ${file ? "bg-green-100 text-green-600 scale-110" : "bg-primary/5 text-primary/40"}
                `}>
                  {file ? <CheckCircle className="w-12 h-12" /> : <FileUp className="w-12 h-12" />}
                </div>

                <div className="text-center">
                  <label 
                    htmlFor="file-upload" 
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                  >
                    <span className="px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all inline-block hover:-translate-y-1">Select File</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      accept=".xml,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1 mt-4 text-sm text-muted-foreground">or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">XML or Excel up to 10MB</p>
                </div>

                {file && (
                  <div className="w-full bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <ShinyButton 
                  onClick={handleUpload} 
                  disabled={!file || uploadMutation.isPending}
                  className="w-full mt-4"
                >
                  {uploadMutation.isPending ? "Processing..." : "Import Data"}
                </ShinyButton>

                {uploadMutation.isError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg w-full">
                    <AlertCircle className="w-4 h-4" />
                    {uploadMutation.error.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
