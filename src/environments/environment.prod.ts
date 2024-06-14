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
     * This key is used to authenticate requests from the app to Firebase services.
     */
    apiKey: "AIzaSyBchnuXNDVVrvb2wZnqycwtlpOykUL13i8",

    /**
     * Auth domain for Firebase authentication.
     * This domain is used for hosting Firebase Authentication UI.
     */
    authDomain: "home-slam.firebaseapp.com",

    /**
     * Project ID for the Firebase project.
     * This is a unique identifier for the Firebase project.
     */
    projectId: "home-slam",

    /**
     * Storage bucket URL for Firebase storage.
     * This URL is used to store and retrieve files in Firebase Storage.
     */
    storageBucket: "home-slam.appspot.com",

    /**
     * Messaging sender ID for Firebase Cloud Messaging.
     * This ID is used to identify the sender of Firebase Cloud Messages.
     */
    messagingSenderId: "953186845113",

    /**
     * App ID for the Firebase application.
     * This is a unique identifier for the Firebase app.
     */
    appId: "1:953186845113:web:a60b0796e386cb700e3668",

    /**
     * Measurement ID for Firebase Analytics.
     * This ID is used to collect and analyze app usage data.
     */
    measurementId: "G-173F4GXFJ4"
  },
};
