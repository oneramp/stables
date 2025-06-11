import React from "react";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

const BottomTabs = () => {
  return (
    <div className="w-full h-24 p-0 flex flex-row items-center justify-between bg-white border-t border-gray-200">
      <Button
        variant="ghost"
        className="flex border-none w-full h-full flex-row items-center justify-center rounded-full py-6 text-base"
      >
        <Wallet className="size-8" />
      </Button>
      <Button
        variant="ghost"
        className="flex border-none w-full h-full flex-row items-center justify-center rounded-full py-6 text-base"
      >
        <Wallet className="size-8" />
      </Button>
      <Button
        variant="ghost"
        className="flex border-none w-full h-full flex-row items-center justify-center rounded-full py-6 text-base"
      >
        <Wallet className="size-16" />
      </Button>
    </div>
  );
};

export default BottomTabs;
