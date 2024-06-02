# IRLQuest

Gamified To-Do application where users can manage and complete Quests to earn
currency which can be used to purchase Rewards.

## Installation - Getting Started

Instructions for running tests, debugging with database emulator, and connecting to a real database can be found below.

1. Clone the repository
2. Install all required packages by running command `npm i`
3. Create a `.env` file to the root and copy/paste everything from .env.example there
4. The package used to authenticate users requires an id and a secret for each authentication method. It is tiresome to maintain the list of those, and thus they can be requested from kripi-png.
5. Run `npm run dev` to start the project.

### How do I see what happens in the emulator?

1. Normally start the emulator and development server by running `npm run dev`
2. Navigate to http://localhost:4000/ and select Firestore

### Testing

1. Create a `cypress.env.json` file to the root
2. Ask for the test user credentials from kripi-png, basse, or someone who has run tests previously
3. Place the credentials inside the file. It should look something like this:
   {
   "GOOGLE_TEST_ID": "maistuis",
   "GOOGLE_TEST_SECRET": "kalja",
   "GOOGLE_TEST_REFRESH_TOKEN": "jos toinenkin"
   }

### Using a real database

To use a real database, you need a few more environment variables. 0. Add keys provided below to .env.dev - VITE_FIREBASE_CLIENT_CONFIG - FIREBASE_PROJECT_ID - FIREBASE_CLIENT_EMAIL - FIREBASE_CLIENT_PRIVATE_KEY

1. Create a new Firebase project. You can disable Google Analytics.
2. Initialize **Firestore Database** (Build > Firestore Database)
3. Add an app for Web through the Project Overview (</> icon). You can skip the SDK installation part.
4. Get started with **Authentication** through the Project Overview, and select and enable **Google** as the provider.
5. Go to project settings and scroll down in General to Your Apps. Select Config under **SDK setup and configuration**. Stringify the object and use it to set VITE_FIREBASE_CLIENT_CONFIG
6. In Project Settings, go to **Service Accounts** tab and Generate new private key
7. After downloading the file, set the remaining three variables using respective values found in the file.
