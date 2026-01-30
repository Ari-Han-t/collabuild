# API Documentation

## Authentication Endpoints

### Register
- **POST** `/api/auth/register`
- **Body**: `{ email, password, name }`
- **Response**: `{ user, token }`

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

### Get Profile
- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ id, email, name, avatar }`

## Project Endpoints

### List Projects
- **GET** `/api/projects`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Project[]`

### Create Project
- **POST** `/api/projects`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name, description, workspaceId? }`
- **Response**: `Project`

### Get Project
- **GET** `/api/projects/:projectId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Project` (with drawings, comments)

### Update Project
- **PUT** `/api/projects/:projectId`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name?, description?, isPublic?, thumbnail? }`
- **Response**: `Project`

### Delete Project
- **DELETE** `/api/projects/:projectId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Project deleted" }`

## WebSocket Events

### Connection
```javascript
socket = io("ws://localhost:3000", {
  auth: { token: "your-jwt-token" }
});
```

### Join Project
```javascript
socket.emit("project:join", projectId);
socket.on("project:joined", ({ projectId }) => {});
socket.on("user:joined", ({ userId, socketId }) => {});
```

### Drawing Updates
```javascript
socket.emit("drawing:update", {
  projectId,
  id,
  type,
  x, y, width, height,
  fill, stroke, opacity, zIndex
});
socket.on("drawing:updated", (drawing) => {});
```

### Drawing Deletion
```javascript
socket.emit("drawing:delete", { projectId, drawingId });
socket.on("drawing:deleted", ({ drawingId }) => {});
```

### Cursor Tracking
```javascript
socket.emit("cursor:move", { projectId, x, y });
socket.on("cursor:moved", ({ userId, x, y }) => {});
```

### Comments
```javascript
socket.emit("comment:add", { projectId, content, x?, y? });
socket.on("comment:added", (comment) => {});
```

### Version Snapshots
```javascript
socket.emit("version:create", { projectId, name, snapshot });
socket.on("version:created", (version) => {});
```
