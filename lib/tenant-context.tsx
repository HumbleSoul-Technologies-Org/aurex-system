"use client";

import React, { createContext, useContext } from "react";
import { TenantContextValue } from "./tenant-context-types";

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error(
      "useTenantContext must be used within TenantContextProvider",
    );
  }
  return context;
}

export default TenantContext;
