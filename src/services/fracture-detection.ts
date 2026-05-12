import { API } from "@/utils/api";

export interface FractureDetectionResult {
  statusCode: number;
  message: string;
  error?: string;
  data: {
    has_fracture: boolean;
    detections: Array<{
      x_min: number;
      y_min: number;
      x_max: number;
      y_max: number;
      confidence: number;
      class_name: string;
    }>;
    annotated_image_base64: string;
    ai_result_analyze: {
      analyze: string;
      treatment_plan: string[];
      medicine_categories: string[];
      medicines: string[];
    } | null;
    processing_time_ms: number;
    analyzed_at: string;
  } | null;
}

const detect = async (
  imageBase64: string,
  notes?: string,
): Promise<FractureDetectionResult> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const body = { imageBase64, notes };

  const response = await fetch(API.FRACTURE_DETECTION, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return data.data;
};

export const FractureDetectionService = {
  detect,
};
