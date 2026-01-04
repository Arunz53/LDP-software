# LDP Software

LDP Software is a comprehensive application designed to manage milk-related operations efficiently. This project encompasses both a web application and an Android application, providing functionalities for user logins, lab reports, data entry, transport management, and accounts handling.

## Features

- **User Authentication**: Secure login system for users to access the application.
- **Lab Reports**: Generate and manage lab reports related to milk quality and vendor information.
- **Data Entry**: Input and manage data related to milk purchases and transactions.
- **Transport Management**: Handle transport-related data entry for efficient logistics.
- **Accounts Management**: Manage user accounts and financial transactions.

## Project Structure

The project is divided into two main parts:

1. **Web Application**: Built using React and TypeScript, located in the `web-app` directory.
   - Entry point: `src/main.tsx`
   - Main components: `LoginForm`, `LabReportForm`, `DataEntryForm`, `TransportForm`, `AccountsForm`
   - Pages: `Dashboard`, `Reports`

2. **Android Application**: Developed using Kotlin, located in the `android-app` directory.
   - Entry point: `MainActivity.kt`
   - Screens: `LoginScreen`, `LabReportScreen`, `DataEntryScreen`, `TransportScreen`, `AccountsScreen`

## Installation

To set up the project locally, follow these steps:

### Web Application

1. Navigate to the `web-app` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Android Application

1. Open the `android-app` directory in Android Studio.
2. Sync the project with Gradle files.
3. Run the application on an emulator or physical device.

## Usage

After setting up the project, users can log in to access various functionalities. The web application provides a user-friendly interface for managing operations, while the Android application allows for on-the-go access to essential features.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.