# SRM Full Stack Engineering Challenge — BFHL API

## Overview
This project implements the required `POST /bfhl` API along with a frontend interface to test it.

---

## Tech Stack
- Node.js
- Express
- HTML, CSS, JavaScript

---

## API

**Endpoint:** `POST /bfhl`  
**Content-Type:** `application/json`

### Request Body
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

### Response Fields
- `user_id`
- `email_id`
- `college_roll_number`
- `hierarchies`
- `invalid_entries`
- `duplicate_edges`
- `summary`

### Processing Covered
- Validates entries in `X->Y` format
- Rejects invalid entries and self-loops
- Tracks duplicate edges after the first occurrence
- Builds multiple independent hierarchies
- Applies first-parent-wins for multi-parent cases
- Detects cycles and returns `tree: {}`
- Calculates depth for non-cyclic trees
- Returns `total_trees`, `total_cycles`, and `largest_tree_root`

## Frontend

The frontend is served from `/` and allows users to:

- Enter node edges
- Submit the request to `/bfhl`
- View the structured API response
- See an error message if the request fails

## Run Locally

```bash
npm install
npm start
```

Server runs on:

```text
http://localhost:3000
```

## Deployment

Start command:

```bash
node index.js
```

The evaluator will call:

```text
<your-base-url>/bfhl
```

## Links
- Hosted API & Frontend: `https://bfhl-tree-analyzer.onrender.com`
- API Endpoint: `https://bfhl-tree-analyzer.onrender.com/bfhl`
