// API Configuration
// This will use the backend URL based on environment

const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://your-backend-app.onrender.com'
                  : 'http://localhost:5000');

export default API_URL;
