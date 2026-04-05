"use client";
import * as React from "react";

export function useToast() {
  const [state] = React.useState({ toasts: [] });

  return {
    ...state,
    toast: () => {},
    dismiss: () => {},
  };
}

export function toast() {
  return {
    id: "",
    dismiss: () => {},
    update: () => {},
  };
}

export const reducer = (state) => state;