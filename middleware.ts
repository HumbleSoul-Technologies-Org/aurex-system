import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_PAGE = "/maintenance";
const MAINTENANCE_IGNORE_PREFIXES = [
  "/api",
  "/_next",
  "/static",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
];
const MAINTENANCE_IGNORE_EXTENSIONS =
  /\.(png|jpe?g|webp|avif|svg|ico|css|js|json)$/i;

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
  const maintenanceMode = (
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE || "live"
  ).toLowerCase();
  const isMaintenancePage = pathname === MAINTENANCE_PAGE;
  const isIgnoredRoute =
    MAINTENANCE_IGNORE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    MAINTENANCE_IGNORE_EXTENSIONS.test(pathname);

  if (!isIgnoredRoute) {
    if (maintenanceMode === "maintenance" && !isMaintenancePage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = MAINTENANCE_PAGE;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (maintenanceMode === "live" && isMaintenancePage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check if this is a protected tenant route
  const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route),
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
    const apiHost = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5454"
    ).replace(/\/+$/, "");
    const settingsResponse = await fetch(
      `${apiHost.replace(/\/api$/, "")}/api/settings/${settingsId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
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
        request.url,
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
    "/((?!_next/|api/|static/|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\.(?:png|jpe?g|webp|avif|svg|ico|css|js|json)).*)",
  ],
};
