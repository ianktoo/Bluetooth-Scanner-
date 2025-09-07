
import { GoogleGenAI, Type } from "@google/genai";
import { DeviceCategory } from "../types";

// FIX: Removed unnecessary 'as string' cast for the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function categorizeDeviceNames(deviceNames: string[]): Promise<Record<string, DeviceCategory>> {
  if (deviceNames.length === 0) {
    return {};
  }

  // FIX: Updated prompt to request a JSON array of objects for better schema definition and reliability.
  const prompt = `
    Based on the following list of Bluetooth device names, classify each one into one of these categories: 
    '${Object.values(DeviceCategory).join("', '")}'.

    Device Names: ${JSON.stringify(deviceNames)}
    
    Return a single JSON array of objects. Each object should have two properties: "name" (the device name from the list) and "category" (the corresponding category). If a category isn't clear, classify it as '${DeviceCategory.Other}'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // FIX: Updated responseSchema to be valid according to Gemini API guidelines.
        // The previous schema used an empty OBJECT type which is not allowed.
        // This new schema expects an array of objects with defined properties.
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'The name of the device.',
              },
              category: {
                type: Type.STRING,
                description: 'The category of the device.',
              },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    // FIX: Updated parsing logic to handle the new array-based JSON structure from the Gemini API.
    const parsedResponse: Array<{name: string, category: string}> = JSON.parse(jsonText);
    
    const result: Record<string, DeviceCategory> = {};
    for (const item of parsedResponse) {
      if (item && item.name && item.category) {
        const { name, category: categoryValue } = item;
        // Validate if the returned category is a valid enum value
        if (Object.values(DeviceCategory).includes(categoryValue as DeviceCategory)) {
            result[name] = categoryValue as DeviceCategory;
        } else {
            result[name] = DeviceCategory.Other; // Fallback for invalid category strings
        }
      }
    }
    
    // Ensure all requested names are in the result
    deviceNames.forEach(name => {
        if (!result[name]) {
            result[name] = DeviceCategory.Unknown;
        }
    });

    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to categorize devices using Gemini API.");
  }
}
