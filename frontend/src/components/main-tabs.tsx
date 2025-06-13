import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { GrGrow } from "react-icons/gr";
import { BiSolidSend } from "react-icons/bi";
import { IoHomeSharp } from "react-icons/io5";

const MainTabs = () => {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Home",
      icon: IoHomeSharp,
      path: "/",
    },
    {
      label: "Pay",
      icon: BiSolidSend,
      path: "/pay",
    },
    {
      label: "Stake",
      icon: GrGrow,
      path: "/stake",
    },
  ];

  return (
    <div className="flex flex-row gap-4 justify-between items-center w-full h-20 bg-white border-t-2">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          href={tab.path}
          className={cn(
            "flex flex-1 flex-row gap-2 justify-center items-center py-3 text-base rounded-none transition-colors",
            pathname === tab.path
              ? "text-primary hover:bg-primary/10"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          <tab.icon className="size-4" />
          <span className="text-base font-semibold">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default MainTabs;
