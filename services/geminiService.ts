
export const getSmartMatch = async (userInput: string) => {
  try {
    const response = await fetch('/api/ai/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Gemini AI Match Error:", error);
    return null;
  }
};

export const generateJobDescription = async (details: string) => {
  try {
    const response = await fetch('/api/ai/generate-job-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ details }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error("Gemini Job Gen Error:", error);
    return "無法生成描述，請手動輸入。";
  }
};
