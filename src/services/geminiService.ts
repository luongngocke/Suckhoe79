/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { UserProfile, HealthLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getHealthAdvice(profile: UserProfile, recentLogs: HealthLog[]) {
  const prompt = `
    Dựa trên thông tin người dùng:
    - Tuổi: ${profile.age}
    - Cân nặng: ${profile.weight}kg
    - Chiều cao: ${profile.height}cm
    - Giới tính: ${profile.gender}
    - Mục tiêu: Cân nặng ${profile.goals.weight}kg, Nước ${profile.goals.water}ml, Ngủ ${profile.goals.sleep}h.

    Nhật ký gần đây: ${JSON.stringify(recentLogs.slice(-10))}

    Hãy đưa ra 3 lời khuyên ngắn gọn, thiết thực bằng tiếng Việt để giúp họ đạt được mục tiêu sức khỏe.
    Trả về định dạng JSON: { "advices": ["khuyên 1", "khuyên 2", "khuyên 3"] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || '{"advices": []}');
    return data.advices as string[];
  } catch (error) {
    console.error("Error getting health advice:", error);
    return ["Uống đủ nước mỗi ngày.", "Duy trì chế độ ăn uống lành mạnh.", "Ngủ đủ giấc để phục hồi cơ thể."];
  }
}

export async function estimateFoodCalories(mealDescription: string) {
  const prompt = `
    Phân tích món ăn sau và ước tính lượng calo: "${mealDescription}"
    Trả về định dạng JSON: { "calories": number, "breakdown": "chuỗi mô tả ngắn gọn" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || '{"calories": 0, "breakdown": ""}');
  } catch (error) {
    console.error("Error estimating calories:", error);
    return { calories: 0, breakdown: "Không thể ước tính" };
  }
}
