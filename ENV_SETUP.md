# Environment Setup

## API Configuration

To configure the API base URL, create a `.env` file in the root directory with the following content:

```
VITE_API_BASE_URL=http://localhost:3000
```

## Default Configuration

If no `.env` file is found, the application will default to `http://localhost:3000` as the API base URL.

## Environment Variables

- `VITE_API_BASE_URL`: The base URL for the backend API (default: http://localhost:3000)

## Usage

The API service layer automatically uses the configured base URL for all API calls. The signin endpoint will be called at `{VITE_API_BASE_URL}/admins/signin`.
