import { NextRequest, NextResponse } from "next/server";

// Routes that require feature toggles
const PROTECTED_ROUTES: Record<
  string,
  {
    feature: string;
    featureKey: string;
  }
> = {
  "/tenant/payments": {
    feature: "payments",
    featureKey: "paymentPortal",
  },
  "/tenant/make-payment": {
    feature: "make-payment",
    featureKey: "paymentPortal",
  },
  "/tenant/maintenance": {
    feature: "maintenance",
    featureKey: "maintenanceRequests",
  },
  "/tenant/messages": {
    feature: "messages",
    featureKey: "messages",
  },
};

// Public/unprotected tenant routes
const UNPROTECTED_TENANT_ROUTES = [
  "/tenant",
  "/tenant/settings",
  "/tenant/contact",
  "/tenant/help",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected tenant route
  const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  const routeConfig = PROTECTED_ROUTES[protectedRoute];

  try {
    // Get the auth token from cookies
    const token = request.cookies.get("auth-token")?.value;
    const settingsId = request.cookies.get("settings-id")?.value;

    if (!token || !settingsId) {
      // Not authenticated, let app handle auth redirect
      return NextResponse.next();
    }

    // Fetch feature toggles from settings API
    const apiHost = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5454').replace(/\/+$/, '');
    const settingsResponse = await fetch(
      `${apiHost.replace(/\/api$/, '')}/api/settings/${settingsId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!settingsResponse.ok) {
      const disabledPageUrl = new URL(
        `/tenant/feature-disabled?feature=${routeConfig.feature}`,
        request.url,
      );
      return NextResponse.redirect(disabledPageUrl);
    }

    const settings = await settingsResponse.json();

    // Extract feature toggle from nested settings structure
    const isFeatureEnabled =
      settings?.tenantPortal?.portalFeatures?.[
        getFeatureKeyMapping(routeConfig.featureKey)
      ] ?? true;

    // If feature is disabled, redirect to disabled page
    if (!isFeatureEnabled) {
      const disabledPageUrl = new URL(
        `/tenant/feature-disabled?feature=${routeConfig.feature}`,
        request.url
      );
      return NextResponse.redirect(disabledPageUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error checking feature toggle:", error);
    const disabledPageUrl = new URL(
      `/tenant/feature-disabled?feature=${routeConfig.feature}`,
      request.url,
    );
    return NextResponse.redirect(disabledPageUrl);
  }
}

/**
 * Map internal feature key names to API field names
 */
function getFeatureKeyMapping(featureKey: string): string {
  const mapping: Record<string, string> = {
    paymentPortal: "rentPayment",
    maintenanceRequests: "maintenanceRequests",
    messages: "messages",
    documentAccess: "documentAccess",
    announcements: "announcements",
    evictionNotice: "evictionNotice",
  };
  return mapping[featureKey] || featureKey;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    "/tenant/:path*",
    // Don't match static files, api routes, etc.
  ],
};
