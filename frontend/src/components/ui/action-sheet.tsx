import React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ActionSheet = ({
  isOpen,
  onClose,
  title,
  children,
}: ActionSheetProps) => {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/20">
      <div className="absolute inset-0 md:w-[26%] md:inset-auto md:h-[90%] md:rounded-[26px] mx-auto bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex justify-between items-center px-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border-none"
            onClick={onClose}
          >
            <X className="size-12" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default ActionSheet;
