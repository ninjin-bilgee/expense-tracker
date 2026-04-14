# Expense Tracker

A full-stack web app for tracking personal expenses. Built as a final project for CSDS 221 at Case Western Reserve University.

Live demo @ https://ninjins-expense-tracker.onrender.com

## What it does

You can add expenses with a description, amount, category, and date. The app shows a running total and breaks down spending by category. You can edit or delete any expense, and filter the list by category.

## Tech stack

- Vue.js for the frontend
- Express.js for the backend API
- MongoDB Atlas for the database
- Deployed on Render

## Features

- Create, read, update, and delete expenses
- Category breakdown with running totals
- Filter expenses by category
- Responsive layout

## Running locally

Clone the repo, then:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

Create a `.env` file in the root with your MongoDB connection string, as shown below:
MONGODB_URI=your_mongodb_connection_string

Start the backend:
```bash
npm run dev
```

In a separate terminal, start the frontend:
```bash
cd client
npm run serve
```

Open http://localhost:8080, and the app will run locally on your device!