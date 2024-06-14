/**
 * Environment configuration for the production environment.
 */
export const environment = {
  /**
   * Flag indicating whether the application is running in production mode.
   */
  production: true,

  /**
   * Base URL for the API.
   */
  apiUrl: 'https://homeslam-service.onrender.com/api',

  /**
   * Firebase configuration settings.
   */
  firebase: {
    /**
     * API key for accessing Firebase services.
     */
    apiKey: "AIzaSyBchnuXNDVVrvb2wZnqycwtlpOykUL13i8",

    /**
     * Auth domain for Firebase authentication.
     */
    authDomain: "home-slam.firebaseapp.com",

    /**
     * Project ID for the Firebase project.
     */
    projectId: "home-slam",

    /**
     * Storage bucket URL for Firebase storage.
     */
    storageBucket: "home-slam.appspot.com",

    /**
     * Messaging sender ID for Firebase Cloud Messaging.
     */
    messagingSenderId: "953186845113",

    /**
     * App ID for the Firebase application.
     */
    appId: "1:953186845113:web:a60b0796e386cb700e3668",

    /**
     * Measurement ID for Firebase Analytics.
     */
    measurementId: "G-173F4GXFJ4"
  },
};
