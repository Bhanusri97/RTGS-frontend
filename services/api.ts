// const API_BASE_URL = 'http://localhost:5002/api';
const ML_SERVICE_URL = "http://localhost:5003/api"; // Kept for other ML endpoints if needed
const API_BASE_URL =
  "https://u454afmq1g.execute-api.ap-south-1.amazonaws.com/dev";

export const BASE_URL = "http://192.168.1.167:5000/api";

// Auth APIs
export const authAPI = {
  login: async (credentials: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// Task APIs
export const taskAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return response.json();
  },

  create: async (taskData: any) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    return response.json();
  },

  update: async (id: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    return response.json();
  },

  // ML Service Integration
  predictDuration: async (description: string) => {
    // Still use Python ML service for this specific feature if needed, or mock it
    try {
      const response = await fetch(`${ML_SERVICE_URL}/predict-duration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      return response.json();
    } catch (error) {
      console.log("ML Service unavailable, using fallback");
      return {
        predicted_duration: "1 hour",
        confidence: 0.5,
        reasoning: "Fallback prediction",
      };
    }
  },
};

// Document APIs
export const documentAPI = {
  upload: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/PdfProcessing`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    return response.json();
  },

  checkStatus: async (jobId: string) => {
    console.log(jobId, "job id=======??")
    const response = await fetch(
      `${API_BASE_URL}/checkJobStatus?jobId=${jobId}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return response.json();
  },

  submitQuery: async (documentId: string, question: string) => {
    const payload = { documentId, question };
    const response = await fetch(`${API_BASE_URL}/document/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const text = await response.text();
    return JSON.parse(text);
  },
};

// Calendar APIs
export const eventsAPI = {
  getById: async (eventId: string) => {
    const response = await fetch(
      `${BASE_URL}/events/getEventById/${eventId}`
    );
    return response.json();
  },
};


// Chat/AI APIs
export const chatAPI = {
  getChats: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/chat?userId=${userId}`);
    return response.json();
  },

  getMessages: async (chatId: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`);
    return response.json();
  },

  sendMessage: async (messageData: any) => {
    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });
    return response.json();
  },
};

// AI Assistant APIs
export const aiAPI = {
  chat: async (query: string, userId: string = "officer1") => {
    // Use Node.js Backend for AI Assistant (Reliable)
    const response = await fetch(`${API_BASE_URL}/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, userId }),
    });
    return response.json();
  },
};
