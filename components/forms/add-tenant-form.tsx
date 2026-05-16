"use client";

import React from "react";
import TenantForm from "./tenant-form";

interface AddTenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export default function AddTenantForm({
  isOpen,
  onClose,
  onSubmit,
}: AddTenantFormProps) {
  if (!isOpen) return null;

  return (
    <TenantForm
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(formData) => {
        onSubmit?.(formData);
      }}
    />
  );
}