# BFHL - SRM Full Stack Engineering Challenge

This project is a submission for the SRM Full Stack Engineering Challenge.

It includes:
- a hosted REST API at `POST /bfhl`
- a frontend to test the API visually
- logic to validate edges, build hierarchies, detect cycles, and generate the required summary

## Tech Stack

- Node.js
- Express
- Vanilla HTML, CSS, and JavaScript

## Project Structure

```text
.
├── index.js
├── package.json
├── package-lock.json
├── public
│   └── index.html
└── README.md
```

## API Endpoint

**Method:** `POST`  
**Route:** `/bfhl`  
**Content-Type:** `application/json`

### Sample Request

```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

### Sample Response Shape

```json
{
  "user_id": "chandraharika_20022005",
  "email_id": "ch9930@srmist.edu.in",
  "college_roll_number": "RA2311029010036",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {}
          },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## Features Implemented

- Validates node format using the required `X->Y` rule
- Rejects self-loops like `A->A`
- Trims input before validation
- Tracks invalid entries
- Tracks duplicate edges after the first occurrence
- Handles multiple disconnected groups
- Applies first-parent-wins logic for diamond or multi-parent cases
- Detects cycles and returns `tree: {}`
- Calculates depth only for non-cyclic trees
- Returns the required summary object
- Enables CORS for cross-origin evaluation

## Frontend

The frontend is served from the `public/` folder and is available from the root route `/`.

It allows the evaluator or user to:
- enter edges as comma-separated or line-separated values
- submit data to the API
- view hierarchies, invalid entries, duplicate edges, and summary output
- see an error message if the API request fails

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm start
```

By default, the app runs on:

```text
http://localhost:3000
```

## Deployment Notes

This project can be deployed on platforms such as:
- Render
- Railway
- Vercel
- Netlify Functions or another Node-compatible hosting setup

For a standard Node deployment, use:

```bash
node index.js
```

## Submission Checklist

- Hosted API base URL
- Hosted frontend URL
- Public GitHub repository URL

The evaluator will call:

```text
<your-base-url>/bfhl
```

## Notes

- The API accepts JSON POST requests at `/bfhl`
- CORS is enabled
- The frontend and backend are served from the same project
- Port is configurable with `process.env.PORT`
