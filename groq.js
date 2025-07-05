
// Groq API functions
async function sendToGroq(messages, imageBase64) {
  try {
    const systemMessage = {
      role: 'system',
      content: config.prompts.system
        .replace(/{AI_NAME}/g, config.ai.name)
        .replace(/{CREATOR}/g, config.ai.creator)
    };

    let apiMessages = [systemMessage, ...messages];

    // Add image to the last user message if provided
    if (imageBase64 && apiMessages.length > 1) {
      const lastMessage = apiMessages[apiMessages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content = [
          {
            type: 'text',
            text: lastMessage.content
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64
            }
          }
        ];
      }
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.api.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.api.model,
        messages: apiMessages,
        temperature: config.api.temperature,
        max_tokens: config.api.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
