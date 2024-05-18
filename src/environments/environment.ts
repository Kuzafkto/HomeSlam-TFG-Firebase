// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiJsonServer: 'http://localhost:3000',
  apiUrl: 'https://homeslam-service.onrender.com/api',
   firebase : {
    apiKey: "AIzaSyBchnuXNDVVrvb2wZnqycwtlpOykUL13i8",
    authDomain: "home-slam.firebaseapp.com",
    projectId: "home-slam",
    storageBucket: "home-slam.appspot.com",
    messagingSenderId: "953186845113",
    appId: "1:953186845113:web:a60b0796e386cb700e3668",
    measurementId: "G-173F4GXFJ4"
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
