"use client";

import { useSettings } from "@/lib/settings-context";
import {
  convertPayloadToTenantPortalSettings,
  FeatureToggles,
} from "@/lib/services/settings";

const defaultTenantPortalFeatures: FeatureToggles = {
  paymentPortal: false,
  maintenanceRequests: false,
  documentAccess: false,
  messages: false,
  evictionNotice: false,
};

export interface TenantPortalFeatureState {
  features: FeatureToggles;
  isLoaded: boolean;
}

/**
 * Hook to access tenant portal feature toggles from settings
 * Returns the current feature toggle state for the tenant portal
 *
 * @returns {{features: FeatureToggles, isLoaded: boolean}}
 * @example
 * const { features, isLoaded } = useTenantPortalFeatures();
 * if (isLoaded && features.messages) { ... }
 */
export function useTenantPortalFeatures(): TenantPortalFeatureState {
  const { settings, /* isLoading, */ isLoaded } = useSettings();

  // Only consider the settings "loaded" state — ignore transient isLoading
  // so background refreshes don't temporarily flip feature flags off and
  // cause UI skeleton flicker.
  if (!isLoaded || !settings) {
    return {
      features: defaultTenantPortalFeatures,
      isLoaded: false,
    };
  }

  const portalSettings = convertPayloadToTenantPortalSettings(settings);
  return {
    features: portalSettings.featureToggles || defaultTenantPortalFeatures,
    isLoaded: true,
  };
}

/**
 * Hook to check if a specific feature is enabled
 * @param featureName - Name of the feature to check
 * @returns {{ enabled: boolean; isLoaded: boolean }}
 * @example
 * const { enabled, isLoaded } = useFeatureEnabled('messages');
 */
export function useFeatureEnabled(featureName: keyof FeatureToggles) {
  const { features, isLoaded } = useTenantPortalFeatures();
  return {
    enabled: isLoaded && (features[featureName] ?? false),
    isLoaded,
  };
}
