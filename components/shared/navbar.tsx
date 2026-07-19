import { GlobalSearch } from "@/components/shared/global-search";
import { NotificationsPopover } from "@/components/shared/notifications-popover";

export function Navbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-2.5 py-1 text-xs font-medium text-success-fg sm:flex">
          <span className="size-1.5 rounded-full bg-success" />
          Session active
        </div>
        <NotificationsPopover />
      </div>
    </header>
  );
}
