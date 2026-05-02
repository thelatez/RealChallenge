import { GEMINI_API_URL_AND_KEY } from "@/services/apiConfig";

export async function validatePhotoChallenge(photoBase64: string | null, requiredObject?: string, requiredColor?: string): Promise<boolean> {
    if (!photoBase64) {
        return false;
    }

    if (!GEMINI_API_URL_AND_KEY) {
        console.warn("GEMINI_API_URL_AND_KEY is not configured.");
        return false;
    }

    const validationSentence = "Valid answers are 'yes' or 'no'."

    const question = requiredObject ? `Does this image show a ${requiredObject}? ${validationSentence}` : `Is this image mostly ${requiredColor}? ${validationSentence}`

    const payload = {
        contents: [{
            parts: [
                {
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: photoBase64
                    }
                },
                { text: question }
            ]
        }]
    };

    try {
        const response = await fetch(GEMINI_API_URL_AND_KEY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (requiredObject) {console.log("RequiredObject:", requiredObject)}
        if (requiredColor) {console.log("RequiredColor:", requiredColor)}
        console.log("Question:", question)
        console.log("Data:", data)
        if (data.candidates[0].content.parts[0].text.trim().toLowerCase() === "yes") {
            console.log("AI answer is yes")
            return true
        } else if(data.candidates[0].content.parts[0].text.trim().toLowerCase() === "no") {
            console.log("AI answer is no")
            return false 
        } else {
            console.log("AI result was neither 'yes' or 'no':", data.candidates[0].content.parts[0].text)
            return false
        }
    } catch (error) {
        console.error("CATCH: Photo validation failed:", error);
        return false;
    }
}