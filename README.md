# Taskward

A real-time collaborative Kanban board built with React, Node.js, and Socket.IO. Teams can create boards, manage work across lists and cards, and see each other's changes instantly without refreshing.

> 🔗 Live demo coming soon

---

## Screenshots

> Screenshots coming soon

---

## Features

- **Real-time collaboration**: card moves, list updates, and comments sync instantly across all connected users via WebSockets
- **Drag and drop**: reorder cards within lists and move them between lists with smooth animations
- **Board membership**: invite team members via shareable links with a 7-day expiry
- **Card details**: add descriptions, due dates, and threaded comments to cards
- **Presence indicators**: see who else is viewing the same board in real time
- **JWT authentication**: secure register and login with persistent sessions
- **Responsive layout**: works on desktop and mobile with a collapsible sidebar

---

## Tech Stack

**Frontend**
- React + Vite
- Zustand — global state management
- dnd-kit — drag and drop
- Socket.IO client — real-time updates
- Tailwind CSS — styling
- Axios — HTTP client
- react-datepicker — date selection

**Backend**
- Node.js + Express
- Socket.IO — WebSocket server
- PostgreSQL — primary database
- JWT — authentication
- bcryptjs — password hashing

---

## Architecture Decisions

**Why Zustand over Redux?**
Zustand provides the same global state capabilities with significantly less boilerplate. For a project this size there's no need for reducers, actions, or a dispatch pattern. Zustand's selector-based subscriptions also prevent unnecessary re-renders out of the box.

**Why Socket.IO over raw WebSockets?**
Socket.IO adds rooms, automatic reconnection, and fallback to HTTP polling when WebSockets aren't available. The room abstraction maps naturally to boards — users join a board's room on mount and leave on unmount, making presence and targeted broadcasts straightforward.

**Why separate `card:move` from `card:update`?**
Card moves are a distinct action from editing card content. They have different data requirements, happen at a much higher frequency (every drag), and are the primary real-time event. Keeping them separate makes the socket event structure cleaner and makes it easier to optimise them independently.

**Optimistic updates for drag and drop**
Card moves update the UI immediately before the API call completes. A snapshot of the previous state is saved before the update — if the API call fails, the UI rolls back automatically. This makes drag and drop feel instant regardless of network latency.

**Float positions for ordering**
Lists and cards use a `FLOAT` column for ordering instead of integers. Inserting a card between two others just averages their positions — no other rows need updating. This keeps drag and drop efficient even with many items.

**JWT stateless authentication**
The server never stores sessions. Every request carries a signed JWT token that the server verifies against its secret. This makes the backend horizontally scalable and keeps authentication logic simple.

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 1. Clone the repository

```bash
git clone https://github.com/MthoNtanzi/Real-time-collab-board
cd taskward
```

### 2. Set up the backend

```bash
cd server
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kanban_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create the database and run migrations:

```bash
psql -U your_db_user -c "CREATE DATABASE kanban_db;"
npm run migrate
```

Start the server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../client
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the client:

```bash
npm run dev
```

Visit `http://localhost:5173` to use the app.

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Boards

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| GET | `/api/boards` | Get all boards for current user | Yes |
| POST | `/api/boards` | Create a new board | Yes |
| GET | `/api/boards/:id` | Get board with lists and cards | Yes |
| PUT | `/api/boards/:id` | Update board | Yes |
| DELETE | `/api/boards/:id` | Delete board (owner only) | Yes |
| POST | `/api/boards/:id/invites` | Generate invite link (owner only) | Yes |
| GET | `/api/boards/invite/:token` | Join board via invite link | Yes |

### Lists

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| POST | `/api/lists` | Create a list | Yes |
| PUT | `/api/lists/:id` | Rename a list | Yes |
| DELETE | `/api/lists/:id` | Delete a list | Yes |

### Cards

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| POST | `/api/cards` | Create a card | Yes |
| GET | `/api/cards/:id` | Get card with comments | Yes |
| PUT | `/api/cards/:id` | Update card | Yes |
| PATCH | `/api/cards/:id/move` | Move card to new list/position | Yes |
| DELETE | `/api/cards/:id` | Delete a card | Yes |

### Comments

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| POST | `/api/cards/:cardId/comments` | Add a comment | Yes |
| DELETE | `/api/comments/:id` | Delete a comment (author only) | Yes |

---

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `board:join` | `boardId` | Join a board room |
| `board:leave` | `boardId` | Leave a board room |
| `card:move` | `{ cardId, listId, position, boardId }` | Move a card |
| `card:created` | `{ card, boardId }` | Broadcast new card |
| `card:updated` | `{ card, boardId }` | Broadcast card update |
| `card:deleted` | `{ cardId, listId, boardId }` | Broadcast card deletion |
| `list:created` | `{ list, boardId }` | Broadcast new list |
| `list:deleted` | `{ listId, boardId }` | Broadcast list deletion |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `presence:update` | `{ boardId, users }` | Updated list of board viewers |
| `card:moved` | `{ cardId, listId, position, boardId, movedBy }` | Card was moved |
| `card:created` | `{ card, boardId }` | New card added |
| `card:updated` | `{ card, boardId }` | Card was updated |
| `card:deleted` | `{ cardId, listId, boardId }` | Card was deleted |
| `list:created` | `{ list, boardId }` | New list added |
| `list:deleted` | `{ listId, boardId }` | List was deleted |

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch — `git checkout -b feat/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feat/your-feature`
5. Open a pull request

Please follow the existing commit message format (`feat:`, `fix:`, `refactor:`, etc.) and keep pull requests focused on a single change.

---

## Roadmap

- [ ] Avatar image uploads via Cloudinary
- [ ] Comment real-time sync when modal is open
- [ ] In-app notifications
- [ ] Board member management UI
- [ ] Card labels and priority tags
- [ ] Due date reminders
