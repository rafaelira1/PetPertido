# Pet Perdido

## App Name

Pet Perdido ("Lost Pet")

## Description

Pet Perdido is a mobile app that helps people in Fortaleza reunite lost pets with their families.

A person who lost a pet publishes an announcement with a photo and the place where the pet was last seen. A person who found an animal takes a photo, and the app uses AI to fill in the announcement. Other users see the announcements, filter them, and contact the author on WhatsApp.

## Features

- Login with email and password.
- Account creation with name, WhatsApp, and acceptance of terms.
- Password recovery by email.
- Home list with separate lost and found tabs.
- Filters for type, species, period, and neighborhood.
- Announcement details and a WhatsApp contact button.
- Lost pet announcement with photo, name, species, size, neighborhood, and date.
- Found animal announcement from a photo. The AI reads the photo and fills in species, breed, color, and size.
- Similar announcements. The AI compares a lost pet with the found animals of the same species (or a found animal with the lost pets) and shows up to 5 that may be the same animal.
- Profile summary and the user's own announcement list.
- Edit and delete the user's own announcements.
- Mark an announcement as reunited.
- If the AI does not answer in 10 seconds, the app continues without it.

## Technologies

- React Native 0.81 and Expo SDK 54
- React Navigation (native stack)
- Firebase Authentication (email and password)
- Cloud Firestore (database and security rules)
- Google Gemini API (reads the photo and compares announcements)
- Expo Image Picker and Expo Image Manipulator (camera, gallery, and photo resize)
- AsyncStorage (keeps the user signed in)

## How to Run

1. Create a Firebase project and register a Web app in Firebase Console.
2. Enable **Email/Password** in Firebase Authentication and create a Cloud Firestore database.
3. Copy `.env.example` to `.env` and add the Firebase app configuration values.
4. Add a Gemini API key from Google AI Studio to `EXPO_PUBLIC_GEMINI_API_KEY` in `.env`. Without the key, the app works, but without the AI features.
5. Publish `firestore.rules` and `firestore.indexes.json` to the Firebase project.
6. Install the dependencies with `npm install`.
7. Start Expo with `npx expo start`.
8. Scan the QR code with Expo Go (SDK 54) on an Android phone, or press `w` to open the app in the browser.

Do not commit `.env`. The app uses Firebase Authentication for accounts and Cloud Firestore for user profiles and pet announcements.

## Data model

The Firestore collection is `announcements`. Each announcement uses `type` (`lost` or `found`), `status` (`active` or `reunited`), `createdAt`, `userId`, `name`, `species`, `breed`, `color`, `size`, `characteristics`, `lastSeenAt`, `neighborhood`, `referencePoint`, and optional `photoUrl`, `contactWhatsapp`, `situation`, and `reunitedAt` fields. The home screen reads active announcements, newest first. Keep `referencePoint` approximate; do not put a precise address or email in this collection. `contactWhatsapp` is used by the contact button and is readable by signed-in clients with the current Firestore rules.
