import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from '@/components/report/ImageUpload';
import LocationPicker from '@/components/report/LocationPicker';
import AIResult from '@/components/report/AIResult';

// AI Classification using vision AI
const classifyDamage = async (imageFile, imageUrl) => {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert road damage detection AI. Analyze this road image and identify the type of damage present.

Classify the damage into ONE of these exact categories:
- Pothole (deep holes in road surface)
- Crack (visible cracks or fissures)
- Waterlogged (standing water on road)
- Broken Edge (damaged road edges)
- Surface Damage (worn out or deteriorated surface)
- Other (if none of the above apply)

Also estimate the severity of the damage on a scale of 0.0 to 1.0 where:
- 0.0-0.5 = Minor damage, low severity
- 0.5-0.7 = Moderate damage, medium severity
- 0.7-0.9 = Significant damage, high severity
- 0.9-1.0 = Critical damage, immediate attention needed

Analyze the image carefully and provide your assessment.`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: "object",
        properties: {
          damageType: {
            type: "string",
            enum: ["Pothole", "Crack", "Waterlogged", "Broken Edge", "Surface Damage", "Other"]
          },
          confidence: {
            type: "number",
            description: "Confidence score between 0.0 and 1.0"
          },
          reasoning: {
            type: "string",
            description: "Brief explanation of the damage detected"
          }
        },
        required: ["damageType", "confidence"]
      }
    });
    
    return result;
  } catch (error) {
    console.error("AI classification error:", error);
    // Fallback to basic classification
    return {
      damageType: "Other",
      confidence: 0.5,
      reasoning: "Unable to analyze image accurately"
    };
  }
};

// Calculate priority based on severity
const calculatePriority = (confidence) => {
  const severityScore = confidence * 100;
  if (severityScore > 85) return "Critical";
  if (severityScore > 60) return "High";
  return "Medium";
};

// Assign department based on damage type
const assignDepartment = (damageType) => {
  if (damageType === "Waterlogged") return "Drainage";
  return "Engineering";
};

// Generate complaint ID
const generateComplaintId = () => {
  const date = new Date();
  const prefix = "SMC";
  const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${dateStr}${random}`;
};

export default function CitizenReport() {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState(null);

  const submitMutation = useMutation({
    mutationFn: async (reportData) => {
      return await base44.entities.Report.create(reportData);
    },
    onSuccess: (data) => {
      setSubmitted(data);
      setImage(null);
      setAiResult(null);
      setReporterName("");
      setReporterPhone("");
    },
    onError: (err) => {
      setError("Failed to submit report. Please try again.");
    },
  });

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      // First upload the image to get a URL
      const { file_url } = await base44.integrations.Core.UploadFile({ file: image });
      
      // Then analyze it with AI
      const result = await classifyDamage(image, file_url);
      const priority = calculatePriority(result.confidence);
      const department = assignDepartment(result.damageType);

      setAiResult({
        ...result,
        priority,
        department,
        severityScore: result.confidence * 100,
        imageUrl: file_url, // Store for later use
      });
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
      console.error(err);
    }
    
    setIsAnalyzing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!image || !location || !aiResult) {
      setError("Please upload an image and wait for AI analysis");
      return;
    }

    setIsUploading(true);

    // Use the already uploaded image URL from AI analysis
    const file_url = aiResult.imageUrl;

    const complaintId = generateComplaintId();

    const reportData = {
      complaintId,
      image: file_url,
      latitude: location.latitude,
      longitude: location.longitude,
      damageType: aiResult.damageType,
      confidence: aiResult.confidence,
      severityScore: aiResult.severityScore,
      priority: aiResult.priority,
      department: aiResult.department,
      status: "Pending",
      reporterName: reporterName || "Anonymous",
      reporterPhone: reporterPhone || "",
    };

    setIsUploading(false);
    submitMutation.mutate(reportData);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-2 border-[#138808] bg-[#138808]/5">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#138808] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a365d] mb-2">Report Submitted!</h2>
              <p className="text-gray-600 mb-6">शिकायत दर्ज हो गई है</p>
              
              <div className="bg-white rounded-lg p-4 border mb-6">
                <p className="text-sm text-gray-500 mb-1">Your Complaint ID</p>
                <p className="text-2xl font-mono font-bold text-[#FF9933]">
                  {submitted.complaintId}
                </p>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Save this ID to track your complaint status
              </p>

              <Button
                className="w-full bg-[#FF9933] hover:bg-[#e68a00]"
                onClick={() => setSubmitted(null)}
              >
                Report Another Issue
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a365d] mb-2">Report Road Damage</h1>
          <p className="text-gray-600">सड़क की समस्या की रिपोर्ट करें</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo / फोटो अपलोड करें *
            </label>
            <ImageUpload 
              image={image} 
              setImage={setImage} 
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onImageRemoved={() => setAiResult(null)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location / स्थान *
            </label>
            <LocationPicker location={location} setLocation={setLocation} />
          </div>

          {/* Analyze Button */}
          {image && !aiResult && (
            <Button
              type="button"
              className="w-full bg-[#1a365d] hover:bg-[#2d4a7c] py-6 text-lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Analyze Damage
                </>
              )}
            </Button>
          )}

          {/* AI Result */}
          <AnimatePresence>
            {aiResult && <AIResult result={aiResult} />}
          </AnimatePresence>

          {/* Contact Info */}
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional) / आपका नाम
                </label>
                <Input
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional) / फ़ोन नंबर
                </label>
                <Input
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="Enter phone number"
                  type="tel"
                  className="h-12"
                />
              </div>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                type="submit"
                className="w-full bg-[#FF9933] hover:bg-[#e68a00] py-6 text-lg font-semibold"
                disabled={submitMutation.isPending || isUploading}
              >
                {submitMutation.isPending || isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Report / रिपोर्ट जमा करें
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}