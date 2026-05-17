"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileImage,
  Trash2,
  ScanLine,
} from "lucide-react";
import {
  FractureDetectionService,
  FractureDetectionResult,
} from "@/services/fracture-detection";
import Image from "next/image";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export default function B1() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FractureDetectionResult | null>(null);

  const sampleImages = [
    "https://res.cloudinary.com/dfdzphroa/image/upload/v1779010398/portfolio/zbd8cfuenif8pj47bujy.png",
    "https://res.cloudinary.com/dfdzphroa/image/upload/v1779010420/portfolio/uwcghabzmslmpbkwvs6s.png",
    "https://res.cloudinary.com/dfdzphroa/image/upload/v1779010459/portfolio/ypslxoxavvxzsxh7pzwj.png",
    "https://res.cloudinary.com/dfdzphroa/image/upload/v1779010481/portfolio/okvtteslapickwwrlffj.png",
    "https://res.cloudinary.com/dfdzphroa/image/upload/v1779010497/portfolio/yb5auaoc2ez1wwnbxwu7.png",
  ];

  const handleSampleSelect = (imageUrl: string) => {
    setError(null);
    setResult(null);
    setSelectedFile(imageUrl);
    setPreviewUrl(imageUrl);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setResult(null);

    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PNG and JPG image files are supported.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be less than 1MB.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = async (file: File | string): Promise<string> => {
    if (typeof file === "string") {
      try {
        const response = await fetch(file);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      } catch (err) {
        throw new Error(err+ 
          `Failed to fetch sample image. Please check your internet connection.`
        );
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDetect = async () => {
    if (!selectedFile) {
      setError("Please select an X-ray image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageBase64 = await fileToBase64(selectedFile);

      const res = await FractureDetectionService.detect(
        imageBase64,
        notes || "",
      );

      // The service returns the raw response object now, so check statusCode
      if (res.statusCode && res.statusCode !== 200) {
        setError(
          res.message || res.error || "An error occurred during analysis.",
        );
        return;
      }

      setResult(res);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during analysis.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const data = result?.data;

  const aiResult = data?.ai_result_analyze;

  return (
    <section className="p-6 w-full max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-clinic-heading text-center">
            AI Fracture <span className="text-primary">Detection</span>
          </h1>
          <p className="text-clinic-text-muted mt-2 max-w-2xl text-center">
            Advanced neural networks analyze X-ray imagery to identify potential
            fractures, dislocations, and structural abnormalities with high
            precision.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Upload & Input */}
        <div className="space-y-4">
          {/* Step 1: Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-clinic-border overflow-hidden">
            <div className="p-4 border-b border-clinic-border bg-clinic-surface-soft/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold">
                  1
                </span>
                <h3 className="text-sm font-bold text-clinic-heading uppercase tracking-wider">
                  Upload X-Ray
                </h3>
              </div>
            </div>

            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  !previewUrl
                    ? "border-clinic-border hover:border-primary/50 hover:bg-primary/5"
                    : "border-primary/30 bg-primary/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="xray-upload"
                />

                {!previewUrl ? (
                  <label
                    htmlFor="xray-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                      <Upload size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-clinic-heading">
                        Select Medical Image
                      </p>
                      <p className="text-xs text-clinic-text-muted mt-2 leading-relaxed">
                        Drag and drop or click to upload.
                        <br />
                        Supported: PNG, JPG, JPEG (Max 4MB)
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-square max-h-[400px] rounded-xl overflow-hidden border-2 border-white shadow-md mx-auto group">
                      <Image
                        src={previewUrl}
                        alt="X-ray preview"
                        className="object-contain w-full h-full bg-black/5"
                        width={400}
                        height={400}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={handleRemoveFile}
                          className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40 transition-colors"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-clinic-border shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <FileImage size={18} className="text-primary" />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="text-xs font-bold text-clinic-heading truncate">
                            {selectedFile instanceof File
                              ? selectedFile.name
                              : typeof selectedFile === "string"
                                ? selectedFile.split("/").pop()
                                : ""}
                          </p>
                          <p className="text-[10px] text-clinic-text-muted">
                            {selectedFile instanceof File
                              ? `${((selectedFile.size || 0) / 1024).toFixed(1)} KB`
                              : "Sample Image"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Test Samples */}
          <div className="bg-white rounded-2xl shadow-sm border border-clinic-border overflow-hidden">
            <div className="p-4 border-b border-clinic-border bg-clinic-surface-soft/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold">
                  !
                </span>
                <h3 className="text-sm font-bold text-clinic-heading uppercase tracking-wider">
                  Quick Test Samples
                </h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[10px] text-clinic-text-muted mb-3 font-medium uppercase tracking-tight">
                Select a sample scan to quickly verify AI performance:
              </p>
              <div className="grid grid-cols-5 gap-2">
                {sampleImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleSelect(img)}
                    disabled={isLoading}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                      ${
                        previewUrl?.includes(img)
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-primary/30"
                      }
                      disabled:opacity-50
                    `}
                  >
                    <Image
                      src={img}
                      alt={`Sample ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Patient Context */}
          <div className="bg-white rounded-2xl shadow-sm border border-clinic-border overflow-hidden">
            <div className="p-4 border-b border-clinic-border bg-clinic-surface-soft/50 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold">
                2
              </span>
              <h3 className="text-sm font-bold text-clinic-heading uppercase tracking-wider">
                Clinical Notes
              </h3>
            </div>
            <div className="p-6">
              <textarea
                id="patient-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe symptoms, patient history, or specific areas of concern..."
                rows={4}
                className="w-full border border-clinic-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-clinic-surface-soft/30 resize-none transition-all placeholder:text-clinic-text-muted/50"
              />
              <p className="mt-2 text-[10px] text-clinic-text-muted flex items-center gap-1">
                <AlertTriangle size={12} />
                AI accuracy improves with clinical context.
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle
                size={18}
                className="text-red-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Detect button action */}
          <div className="pt-4">
            <AnimatePresence mode="wait">
              {!selectedFile ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-clinic-surface-soft border border-clinic-border rounded-xl p-4 text-center"
                >
                  <p className="text-xs text-clinic-text-muted font-medium">
                    Please upload an X-ray image to start analysis
                  </p>
                </motion.div>
              ) : (
                <motion.button
                  key="detect-button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDetect}
                  disabled={isLoading}
                  className={`
                    w-full relative group overflow-hidden flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-white shadow-xl transition-all duration-300 border border-gray-200
                    ${
                      isLoading
                        ? "bg-clinic-text-muted cursor-wait"
                        : "bg-gradient-to-r from-primary via-primary to-primary/90 shadow-primary/20 hover:shadow-primary/30"
                    }
                  `}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none " />

                  {isLoading ? (
                    <>
                      <Loader
                        size={20}
                        className="animate-spin text-black"
                      />
                      <span className="tracking-widest uppercase text-sm text-black">
                        Analyzing...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                        <ScanLine size={20} className="text-black" />
                      </div>
                      <span className="tracking-widest uppercase text-sm text-black">
                        Start Detection
                      </span>
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 scrollbar-thin scrollbar-thumb-clinic-border">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-clinic-border shadow-sm h-full">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanLine size={32} className="text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-clinic-heading">
                Running AI Diagnostics
              </h3>
              <p className="text-sm text-clinic-text-muted mt-2 max-w-xs mx-auto">
                Processing pixels through neural layers to identify structural
                anomalies...
              </p>
              <div className="mt-8 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-clinic-surface-soft/30 rounded-2xl border-2 border-dashed border-clinic-border h-full">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                <ScanLine size={40} className="text-clinic-border" />
              </div>
              <h3 className="text-lg font-bold text-clinic-heading">
                Awaiting Scan
              </h3>
              <p className="text-sm text-clinic-text-muted mt-2 max-w-xs">
                Upload an X-ray and click &apos;Start Detection&apos; to
                generate an AI diagnostic report.
              </p>
            </div>
          )}

          {data && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Report Header */}
              <div className="bg-white rounded-2xl shadow-md border border-clinic-border overflow-hidden">
                <div
                  className={`p-1 ${data.has_fracture ? "bg-red-500" : "bg-green-500"}`}
                />
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                          data.has_fracture
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {data.has_fracture ? (
                          <XCircle size={32} />
                        ) : (
                          <CheckCircle2 size={32} />
                        )}
                      </div>
                      <div>
                        <h2
                          className={`text-xl font-black uppercase tracking-tight ${
                            data.has_fracture
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          {data.has_fracture
                            ? "Abnormality Detected"
                            : "No Fracture Found"}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-clinic-text-muted flex items-center gap-1 bg-clinic-surface-soft px-2 py-0.5 rounded">
                            <Loader size={10} /> LATENCY:{" "}
                            {data.processing_time_ms}ms
                          </span>
                          <span className="text-[10px] font-bold text-clinic-text-muted flex items-center gap-1 bg-clinic-surface-soft px-2 py-0.5 rounded uppercase">
                            CONFIDENCE:{" "}
                            {(
                              (data.detections?.[0]?.confidence || 0) * 100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Image Visualization */}
              {data.annotated_image_base64 && (
                <div className="bg-white rounded-2xl shadow-md border border-clinic-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-clinic-border flex items-center justify-between bg-clinic-surface-soft/50">
                    <h4 className="text-[10px] font-black text-clinic-heading uppercase tracking-[0.2em]">
                      Diagnostic Visualization
                    </h4>
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                      AI Overlay Active
                    </span>
                  </div>
                  <div className="p-4 bg-black/90">
                    <div className="relative group cursor-zoom-in">
                      <Image
                        src={`data:image/jpeg;base64,${data.annotated_image_base64}`}
                        alt="Annotated X-ray"
                        className="w-full h-auto rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                        width={800}
                        height={800}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {data.detections && data.detections.length > 0 && (
                          <div className="bg-red-600/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">
                            {data.detections.length} ANOMALIES IDENTIFIED
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Diagnostic Report */}
              {aiResult && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Detailed Analysis */}
                  <div className="bg-white rounded-2xl shadow-md border border-clinic-border overflow-hidden">
                    <div className="px-5 py-3 border-b border-clinic-border bg-clinic-surface-soft/50">
                      <h4 className="text-[10px] font-black text-clinic-heading uppercase tracking-[0.2em]">
                        Clinical Findings
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ScanLine size={16} className="text-primary" />
                        </div>
                        <p className="text-sm text-clinic-text leading-relaxed font-medium">
                          {aiResult.analyze}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Treatment & Meds */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Treatment Plan */}
                    <div className="bg-white rounded-2xl shadow-md border border-clinic-border overflow-hidden">
                      <div className="px-5 py-3 border-b border-clinic-border bg-clinic-surface-soft/50">
                        <h4 className="text-[10px] font-black text-clinic-heading uppercase tracking-[0.2em]">
                          Treatment Plan
                        </h4>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {aiResult.treatment_plan?.map((step, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className="shrink-0 w-5 h-5 rounded-md bg-clinic-surface-soft flex items-center justify-center text-[10px] font-bold text-clinic-heading border border-clinic-border">
                                {idx + 1}
                              </div>
                              <p className="text-xs text-clinic-text leading-tight mt-0.5">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="bg-white rounded-2xl shadow-md border border-clinic-border overflow-hidden">
                      <div className="px-5 py-3 border-b border-clinic-border bg-clinic-surface-soft/50">
                        <h4 className="text-[10px] font-black text-clinic-heading uppercase tracking-[0.2em]">
                          Recommendations
                        </h4>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {aiResult.medicines?.map((med, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2 bg-clinic-surface-soft/30 rounded-lg border border-clinic-border/50"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-xs font-bold text-clinic-heading">
                                {med}
                              </span>
                            </div>
                          ))}
                          {(!aiResult.medicines || aiResult.medicines.length === 0) && (
                            <p className="text-xs text-clinic-text-muted italic">
                              No specific medications recommended.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 bg-clinic-surface-soft/50 rounded-xl border border-clinic-border text-center">
                <p className="text-[9px] text-clinic-text-muted uppercase font-bold tracking-widest leading-loose">
                  Disclaimer: This is an AI-generated report for
                  educational/research purposes. Always consult with a qualified
                  medical professional for clinical diagnosis.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
