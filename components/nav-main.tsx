"use client";

import { ChevronRight } from "lucide-react";

import { usePathname } from "next/navigation";

import { BiCoffee, BiSolidCoffee } from "react-icons/bi";
import { PiPresentation, PiPresentationFill } from "react-icons/pi";
import { AiOutlineLineChart, AiOutlineAreaChart } from "react-icons/ai";
import { IoBook, IoBookOutline } from "react-icons/io5";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import React from "react";
import Link from "next/link";
import { NavItemType } from "@/lib/types";

const navMain: NavItemType[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <BiCoffee />,
    activeIcon: <BiSolidCoffee />,
    isActive: false,
  },
  {
    title: "Evaluate",
    url: "/dashboard/eval-settings",
    icon: <PiPresentation />,
    activeIcon: <PiPresentationFill />,
    isActive: false,
  },
  {
    title: "Progress",
    url: "/dashboard/progress",
    icon: <AiOutlineLineChart />,
    activeIcon: <AiOutlineAreaChart />,
    items: [
      {
        title: "statistics",
        url: "/dashboard/progress/",
      },
      {
        title: "previous sessions",
        url: "/dashboard/progress/previous",
      },
    ],
  },
  {
    title: "Learning",
    url: "/dashboard/learning",
    icon: <IoBookOutline />,
    activeIcon: <IoBook />,
  },
];

/**
 * Renders the main navigation menu.
 * @returns The rendered main navigation menu.
 */
export function NavMain() {
  const pathname = usePathname() ?? "";

  const [items, setItems] = React.useState<NavItemType[]>(navMain);
  const [path, setPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    const pathTitle =
      pathname.split("/").length < 3 ? "dashboard" : pathname.split("/")[2];
    setPath(pathTitle);
  }, [pathname]);

  React.useEffect(() => {
    setItems(
      navMain.map((navItem) => {
        return {
          ...navItem,
          isActive: path == navItem.title.toLowerCase(),
        };
      }),
    );
  }, [path]);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {!item.isActive && (
                    <a href={item.url} className="text-lg">
                      {item.icon}
                    </a>
                  )}
                  {item.isActive && item.activeIcon}
                  {item.items ? (
                    <span>{item.title}</span>
                  ) : (
                    <Link href={item.url}>{item.title}</Link>
                  )}
                  {item.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
