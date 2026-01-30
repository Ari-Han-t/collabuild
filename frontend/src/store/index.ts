import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import canvasReducer from "./canvasSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    canvas: canvasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
