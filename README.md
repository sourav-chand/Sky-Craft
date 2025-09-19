# Sky Craft

Sky Craft is a powerful AI-powered application that provides various functionalities, including article generation, blog title generation, image manipulation, and resume review.

## Installation Guide

Follow these steps to set up and run Sky Craft on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   Postman (or any API client) for testing API endpoints
*   A Clerk account for authentication
*   A Gemini API Key
*   A Cloudinary account for image storage
*   Clipdrop for image manipulation and generation

### Backend Setup (Server)

1.  **Navigate to the server directory:**

    ```bash
    cd server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file:**

    In the `server` directory, create a file named `.env` and add the following environment variables. Replace the placeholder values with your actual credentials:

    ```
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key_here
    CLERK_SECRET_KEY=your_clerk_secret_key_here
    CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    DATABASE_URL=your_database_connection_string
    CLIENT_URL=http://localhost:5173
    CLIPDROP_API_KEY=your_clipdrop_api_key_here

    ```

4.  **Start the backend server:**

    ```bash
    npm run server
    ```

    The server will start on the port specified in your `.env` file (e.g., `http://localhost:3000`).

### Frontend Setup (Client)

1.  **Navigate to the client directory:**

    ```bash
    cd ../client
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file:**

    In the `client` directory, create a file named `.env` and add the following environment variables:

    ```
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
    VITE_SERVER_URL=http://localhost:3000
    ```

4.  **Start the frontend development server:**

    ```bash
    npm run dev
    ```

    The frontend application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## API Endpoints

All API endpoints require authentication using a Clerk-generated JWT token in the `Authorization` header (e.g., `Bearer your_jwt_token`) and token will be valid for 1 minute only.

### 1. Generate Article

*   **Endpoint:** `/api/ai/generate-article`
*   **Method:** `POST`
*   **Description:** Generates an article based on a given prompt and desired length.
*   **Request Body (JSON):**

    ```json
    {
      "prompt": "Your article topic or starting sentence",
      "length": 500
    }
    ```

    *   `prompt` (string, required): The topic or prompt for the article.
    *   `length` (number, required): The desired maximum length of the article in tokens.

*   **Example Response (JSON):**

    ```json
    {
      "success": true,
      "content": "The generated article content goes here..."
    }
    ```

### 2. Generate Blog Title

*   **Endpoint:** `/api/ai/generate-blog-title`
*   **Method:** `POST`
*   **Description:** Generates a blog title based on a given prompt.
*   **Request Body (JSON):**

    ```json
    {
      "prompt": "Your blog topic or keywords"
    }
    ```

    *   `prompt` (string, required): The topic or keywords for the blog title.

*   **Example Response (JSON):**

    ```json
    {
      "success": true,
      "content": "The generated blog title goes here..."
    }
    ```

### 3. Generate Image

*   **Endpoint:** `/api/ai/generate-image`
*   **Method:** `POST`
*   **Description:** Generates an image based on a given prompt.
*   **Request Body (JSON):**

    ```json
    {
      "prompt": "Description of the image to generate"
    }
    ```

    *   `prompt` (string, required): A detailed description of the image to generate.

*   **Example Response (JSON):**

    ```json
    {
      "success": true,
      "content": "URL to the generated image that uploaded on cloudinary"
    }
    ```

### 4. Remove Image Background

*   **Endpoint:** `/api/ai/remove-image-background`
*   **Method:** `POST`
*   **Description:** Removes the background from an uploaded image.
*   **Request Body (FormData):**

    *   `image` (file, required): The image file to process.

*   **Example Response (JSON):**

    ```json
    {
      "success": true,
      "content": "URL to the image with background removed"
    }
    ```

### 5. Remove Image Object

*   **Endpoint:** `/api/ai/remove-image-object`
*   **Method:** `POST`
*   **Description:** Removes a specified object from an uploaded image.
*   **Request Body (FormData):**

    *   `image` (file, required): The image file to process.
    *   `object_to_remove` (string, required): A description of the object to remove from the image.

*   **Example Response (JSON):**

    ```json
    {
      "success": true,
      "content": "URL to the image with the object removed"
    }
    ```

### 6. Resume Review

*   **Endpoint:** `/api/ai/resume-review`
*   **Method:** `POST`
*   **Description:** Reviews an uploaded resume and provides feedback.
*   **Request Body (FormData):**

    *   `resume` (file, required): The resume file (PDF) to review.

*   **Example Response (JSON):**

    ```json
    {
      "success": true,
      "content": "Feedback and suggestions for the resume"
    }
    ```

## Troubleshooting

*   **" if no response from API endpoint**: This usually indicates an authentication issue. Ensure your `Authorization` header has a valid Clerk JWT token. If testing locally, you might temporarily comment out `app.use(requireAuth());` in `server.js`.
*   **"A valid resource ID is required."**: This error comes from Clerk and means the authentication token is missing or invalid. Check your token and ensure it's correctly formatted as `Bearer your_token`.
*   **`.env` variables not loading**: Ensure your `.env` file is in the correct directory (`server/` for backend, `client/` for frontend) and that your server has been restarted after any changes to the `.env` file.