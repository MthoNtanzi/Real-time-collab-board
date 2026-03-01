# Kanban Board

A lightweight, real-time collaborative project management tool inspired by Trello and Miro. Users can create boards, organize work into lists, and manage tasks as draggable cards — all synced live across multiple users.

## Purpose

This project was built to explore complex UI interactions and real-time collaboration features that are common in modern web applications. The focus is on mastering drag-and-drop behaviour, WebSocket-driven state synchronisation, and building a smooth, responsive user experience.

## Features

- Create, update, and delete boards, lists, and cards
- Drag and drop cards between lists
- Card details including title, description, due date, and comments
- Real-time updates — changes made by one user are instantly reflected for all others on the same board
- User presence indicators showing who is currently viewing a board

## Tech Stack

**Frontend:** React, dnd-kit, Socket.IO-client, Zustand, Tailwind CSS

**Backend:** Node.js, Express, Socket.IO

**Database:** PostgreSQL