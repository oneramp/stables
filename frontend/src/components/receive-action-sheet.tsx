import { useAccount } from "wagmi";
import ActionSheet from "./ui/action-sheet";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface ReceiveActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiveActionSheet = ({ isOpen, onClose }: ReceiveActionSheetProps) => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ActionSheet isOpen={isOpen} onClose={onClose} title="Receive KESC">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center gap-8">
          {address ? (
            <>
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={address}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="w-full">
                <p className="text-sm text-gray-500 mb-2">Your Address</p>
                <div className="space-y-1 border-[1px] bg-neutral-100 border-gray-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2 break-all">
                    <span className="text-xl font-semibold">{address}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-500">
                      Address copied to clipboard!
                    </p>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Share your address to receive KESC</p>
                <p>Only send KESC to this address</p>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              Please connect your wallet to receive KESC
            </div>
          )}
        </div>
      </div>
    </ActionSheet>
  );
};

export default ReceiveActionSheet;
