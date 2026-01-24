import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

// 🔹 Send webcam image to Flask for emotion detection
export const sendFrameToBackend = async(image) => {
    const response = await axios.post(`${BASE_URL}/api/emotion`, {
        image: image
    });

    return response.data; // { emotion, suggestion }
};

// 🔹 Fetch analytics data from Flask
export const fetchAnalytics = async() => {
    const response = await axios.get(`${BASE_URL}/api/analytics`);
    return response.data; // { Happy: 10, Sad: 5, ... }
};