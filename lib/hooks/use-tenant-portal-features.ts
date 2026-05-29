"use client";

import { useSettings } from "@/lib/settings-context";
import { convertPayloadToTenantPortalSettings, FeatureToggles } from "@/lib/services/settings";
import React, { Suspense, useEffect, useState } from "react";


/**
 * Hook to access tenant portal feature toggles from settings
 * Returns the current feature toggle state for the tenant portal
 *
 * @returns {FeatureToggles} Object with boolean flags for each feature
 * @example
 * const features = useTenantPortalFeatures();
 * if (features.messages) { ... }
 */
export function useTenantPortalFeatures(): FeatureToggles {
  const { settings, isLoading } = useSettings();
  


  // If settings are loading or not available, return all features enabled (default)
  if (!settings || isLoading) {
    return {
      paymentPortal: true,
      maintenanceRequests: true,
      documentAccess: true,
      messages: true,
      evictionNotice: false,
    };
  }

  // Convert API payload to portal settings and extract feature toggles
  const portalSettings = convertPayloadToTenantPortalSettings(settings);
  return portalSettings.featureToggles || {};
}

/**
 * Hook to check if a specific feature is enabled
 * @param featureName - Name of the feature to check
 * @returns {boolean} True if feature is enabled, false otherwise
 * @example
 * const isMessagesEnabled = useFeatureEnabled('messages');
 */
export function useFeatureEnabled(featureName: keyof FeatureToggles): boolean {
  const features = useTenantPortalFeatures();
  return features[featureName] ?? true; // Default to enabled if not explicitly disabled
}
