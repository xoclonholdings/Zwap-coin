import React, { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Footprints,
  Play,
  CheckSquare,
  ShoppingBag,
  User,
} from "lucide-react";

function ZwapBangIcon({ isActive = false }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black tracking-[-0.06em] transition ${
        isActive
          ? "border-cyan-400/30 bg-cyan-400/14 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.16)]"
          : "border-white/10 bg-white/[0.04] text-white/82"
      }`}
    >
      !
    </div>
  );
}

function TabItem({
  label,
  to,
  icon,
  isActive,
  onClick,
  center = false,
  isButton = false,
}) {
  const baseClassName = `group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 transition ${
    center
      ? isActive
        ? "bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(255,255,255,0.02))]"
        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]"
      : isActive
      ? "bg-white/[0.06]"
      : "bg-transparent"
  }`;

  const labelClassName = `truncate text-[10px] font-medium tracking-[0.02em] transition ${
    isActive ? "text-white" : "text-white/56"
  }`;

  const iconClassName = `transition ${
    isActive ? "text-cyan-300" : "text-white/62"
  }`;

  const content = (
    <>
      <div className={iconClassName}>{icon}</div>
      <span className={labelClassName}>{label}</span>
    </>
  );

  if (isButton) {
    return (
      <button type="button" onClick={onClick} className={baseClassName}>
        {content}
      </button>
    );
  }

  return (
    <NavLink to={to} className={baseClassName} onClick={onClick}>
      {content}
    </NavLink>
  );
}

export default function TabNavigationV1({
  shopUnlocked = false,
  onOpenAccount,
  homeRoute = "/",
  moveRoute = "/move",
  playRoute = "/play",
  tasksRoute = "/tasks",
  shopRoute = "/shop",
  className = "",
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const items = useMemo(() => {
    return [
      {
        key: "move",
        label: "Move",
        to: moveRoute,
        icon: <Footprints className="h-[18px] w-[18px]" strokeWidth={2.1} />,
      },
      {
        key: "play",
        label: "Play",
        to: playRoute,
        icon: <Play className="h-[18px] w-[18px]" strokeWidth={2.1} />,
      },
      {
        key: "home",
        label: "ZWAP!",
        to: homeRoute,
        center: true,
      },
      {
        key: shopUnlocked ? "shop" : "tasks",
        label: shopUnlocked ? "Shop" : "Tasks",
        to: shopUnlocked ? shopRoute : tasksRoute,
        icon: shopUnlocked ? (
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.1} />
        ) : (
          <CheckSquare className="h-[18px] w-[18px]" strokeWidth={2.1} />
        ),
      },
      {
        key: "account",
        label: "Account",
        isButton: true,
        icon: <User className="h-[18px] w-[18px]" strokeWidth={2.1} />,
      },
    ];
  }, [shopUnlocked, homeRoute, moveRoute, playRoute, tasksRoute, shopRoute]);

  const isRouteActive = (to) => {
    if (!to) return false;
    if (to === "/") return currentPath === "/";
    return currentPath === to || currentPath.startsWith(`${to}/`);
  };

  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-auto w-full max-w-[430px]">
        <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,26,0.96),rgba(5,10,16,0.98))] px-2 py-2 shadow-[0_16px_38px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <div className="flex items-stretch gap-1.5">
            {items.map((item) => {
              if (item.key === "home") {
                const active = isRouteActive(item.to);

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className={`group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 transition ${
                      active
                        ? "bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(255,255,255,0.02))]"
                        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]"
                    }`}
                  >
                    <ZwapBangIcon isActive={active} />
                    <span
                      className={`truncate text-[10px] font-medium tracking-[0.02em] ${
                        active ? "text-white" : "text-white/60"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              if (item.isButton) {
                return (
                  <TabItem
                    key={item.key}
                    label={item.label}
                    icon={item.icon}
                    isActive={false}
                    isButton={true}
                    onClick={onOpenAccount}
                  />
                );
              }

              return (
                <TabItem
                  key={item.key}
                  label={item.label}
                  to={item.to}
                  icon={item.icon}
                  isActive={isRouteActive(item.to)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}