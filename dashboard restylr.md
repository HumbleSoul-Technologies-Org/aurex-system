## Plan: Responsive Admin and Tenant Dashboards

TL;DR - Refine the dashboard layouts for admin and tenant users so cards, charts, and navigation respond cleanly at mobile and tablet sizes. Keep current page structure but correct breakpoint usage and ensure no horizontal overflow.

**Steps**
1. Update admin dashboard grids in `app/dashboard/page.tsx`.
   - Replace the top metrics grid classes `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4` with a layout better suited for four cards, such as `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4`.
   - Confirm each card body uses `min-w-0` for flex text containers and that the icon container is `flex-shrink-0`.
2. Tune admin chart layout and card stacking in `app/dashboard/page.tsx`.
   - Keep the charts area as `grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6`, with the revenue chart spanning two columns at large widths.
   - Make sure the `ResponsiveContainer` chart wrappers fill width and do not force horizontal scrolling.
   - Add mobile-friendly chart axis settings or label truncation if chart labels crowd on narrow screens.
3. Improve tenant dashboard card layout in `app/tenant/page.tsx`.
   - Use `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4` for the top quick stat cards.
   - Maintain `grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4` for the quick actions and recent activity sections.
   - Ensure any flex children with text use `min-w-0` and truncation classes for long labels.
4. Review tenant portal layout behavior in `app/tenant/layout.tsx`.
   - Confirm the mobile content wrapper and bottom navigation do not conflict; keep `main` with `overflow-auto pb-20 md:pb-0`.
   - If needed, adjust the outer layout from fixed `h-[calc(100vh-64px)]` to `min-h-screen` for better scrolling on very small screens.
5. Validate admin layout container and mobile sidebar in `app/dashboard/layout.tsx`.
   - Ensure the sidebar toggler works on mobile and that the main content uses plain `overflow-auto` so page scrolling behaves correctly when the sidebar is closed.
   - Confirm the notification drawer overlay does not create extra scroll or hidden content.
6. Cross-check all card widths and panel spacing.
   - Verify `Card` elements and buttons are full-width where expected on small screens.
   - Verify grid gaps and padding are consistent across breakpoints.

**Relevant files**
- `app/dashboard/page.tsx`
- `app/dashboard/layout.tsx`
- `app/tenant/page.tsx`
- `app/tenant/layout.tsx`

**Verification**
1. Test the admin dashboard at 320px, 375px, 425px, 768px, 1024px, and 1280px.
2. Test the tenant dashboard at the same breakpoints and verify bottom navigation plus header behavior.
3. Confirm no horizontal scrollbar appears on either dashboard.
4. Confirm metric cards do not shrink too much and action buttons remain touch-friendly.
5. Confirm left sidebar toggles on admin mobile and the tenant bottom nav does not overlap page content.

**Decisions**
- Use existing Tailwind responsive utilities and grid classes rather than introducing custom CSS.
- Keep current dashboard pages and layouts; this is a layout adjustment, not a full redesign.
- Focus on both admin and tenant dashboards in the same pass to keep behavior consistent.

**Further Considerations**
1. If charts remain too cramped on mobile, consider swapping some visualizations for summary cards or smaller heights on narrow screens.
2. If the tenant page still feels crowded, add explicit `pb-[5rem]` to `main` to preserve bottom nav space.
3. If desktop admin sidebar behavior is poor at tablet breakpoints, consider adding a `md:max-w-[calc(100%-16rem)]` or equivalent to the main content wrapper.
