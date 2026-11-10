# Pet Perdido

Expo and React Native app for helping people in Fortaleza reunite lost pets with their families.

## Setup

1. Create a Firebase project and register a Web app in Firebase Console.
2. Enable **Email/Password** in Firebase Authentication and create a Cloud Firestore database.
3. Copy `.env.example` to `.env` and add the Firebase app configuration values.
4. Install the dependencies with `npm install`.
5. Start Expo with `npx expo start`.
6. Publish `firestore.rules` and `firestore.indexes.json` to the Firebase project.

Do not commit `.env`. The app uses Firebase Authentication for accounts and Cloud Firestore for user profiles and pet announcements.

## First app scope

- Login with email and password.
- Account creation with name, WhatsApp, and acceptance of terms.
- Password recovery by email.
- Home list with separate lost and found tabs.
- Filters for type, species, period, and neighborhood.
- Profile summary and the user's own announcement list.
- Announcement details and a WhatsApp contact button.

The first Firestore collection is `announcements`. Each announcement uses `type` (`lost` or `found`), `status` (`active` or `reunited`), `createdAt`, `userId`, `name`, `species`, `breed`, `color`, `size`, `characteristics`, `lastSeenAt`, `neighborhood`, `referencePoint`, and optional `photoUrl` and `contactWhatsapp` fields. The home screen reads active announcements, newest first. Keep `referencePoint` approximate; do not put a precise address or email in this collection. `contactWhatsapp` is used by the contact button and is readable by signed-in clients with the current Firestore rules.
