const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env

// Function to interact with Gemini API
const getGeminiResponse = async (message) => {
  try {
    // Request to Gemini API
    const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      contents: [{ parts: [{ text: message }] }] // Send the user message as input to Gemini
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OAUTH_ACCESS_TOKEN}`, // Use OAuth token here
        'Content-Type': 'application/json'
      }
    });

    return response.data; // Return the response data from Gemini API
  } catch (error) {
    console.error('Gemini API error:', error);
    return { message: 'Sorry, something went wrong with the AI.' }; // Fallback error message
  }
};

module.exports = getGeminiResponse;
