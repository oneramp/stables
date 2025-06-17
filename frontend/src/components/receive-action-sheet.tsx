import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useAccount } from "wagmi";
import ActionSheet from "./ui/action-sheet";
import { Button } from "./ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface ReceiveActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "amount" | "qr";

// Define keypad letters
const KEYPAD_LETTERS: { [key: string]: string } = {
  "1": "",
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
  "0": "",
};

// Get QueryClient from the context
const queryClient = useQueryClient();

const ReceiveActionSheet = ({ isOpen, onClose }: ReceiveActionSheetProps) => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("amount");

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNumberPress = (num: string) => {
    if (amount === "0") {
      setAmount(num);
    } else {
      setAmount((prev) => {
        const newAmount = prev + num;
        const [decimal] = newAmount.split(".");
        if (decimal && decimal.length > 2) return prev;
        if (parseFloat(newAmount) > 999999.99) return prev;
        return newAmount;
      });
    }
  };

  const handleDecimalPress = () => {
    if (!amount.includes(".")) {
      setAmount((prev) => prev + ".");
    }
  };

  const handleBackspace = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const getPaymentUrl = () => {
    if (!address || !amount) return "";
    return `ethereum:${address}@11155111/transfer?value=${amount}&token=0x123...`;
  };

  const renderNumberPad = () => (
    <div className="flex flex-col h-full px-4 bg-[#f5f5f5]">
      {/* Amount Display */}
      <div className="flex flex-col justify-center items-center py-8">
        <div className="flex gap-4 justify-center items-center">
          {amount.split("").map((digit, index) => (
            <div
              key={index}
              className="text-5xl font-semibold text-neutral-800  pb-1 min-w-[20px] text-center"
            >
              {digit}
            </div>
          ))}
          {amount.length === 0 && (
            <div className="text-4xl font-medium text-neutral-300  pb-1 min-w-[20px] text-center">
              0
            </div>
          )}
        </div>
        <div className="mt-3 text-sm text-neutral-600">Enter Amount (KESC)</div>
      </div>

      {/* Number Pad */}
      <div className="flex-1 px-6 pt-4">
        <div className="grid grid-cols-3 h-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "←"].map((num, index) => (
            <Button
              key={num}
              variant="ghost"
              onClick={() => {
                if (num === ".") handleDecimalPress();
                else if (num === "←") handleBackspace();
                else handleNumberPress(num.toString());
              }}
              className={`
                flex flex-col border-none bg-transparent items-center justify-center 
                ${
                  typeof num === "number"
                    ? "hover:bg-neutral-100 active:bg-neutral-200"
                    : ""
                }
                ${num === "←" ? "bg-neutral-100" : ""}
                transition-colors
                ${index % 3 !== 2 ? "border-r border-neutral-200" : ""}
                ${index < 9 ? "border-b border-neutral-200" : ""}
              `}
            >
              <span className="text-2xl font-light text-neutral-800">
                {num === "←" ? "⌫" : num}
              </span>
              {typeof num === "number" && KEYPAD_LETTERS[num] && (
                <span className="text-[10px] text-neutral-500 mt-1">
                  {KEYPAD_LETTERS[num]}
                </span>
              )}
            </Button>
          ))}

          {/* Continue Button */}
          <Button
            onClick={() => setStep("qr")}
            disabled={!amount || parseFloat(amount) === 0}
            className="p-4 mb-4 w-full h-14 font-medium text-white rounded-full border-none transition-colors disabled:bg-neutral-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );

  const renderQRCode = () => (
    <div className="flex flex-col h-full bg-[#f5f5f5]">
      <div className="flex flex-col flex-1 gap-8 items-center pt-8">
        {address ? (
          <>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-neutral-800">
                {parseFloat(amount).toLocaleString()} KESC
              </div>
              <p className="text-neutral-600">Scan to pay</p>
            </div>

            <div className="p-8 bg-white rounded-3xl shadow-sm">
              <QRCodeSVG
                value={getPaymentUrl()}
                size={250}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="px-6 w-full">
              <p className="mb-2 text-sm text-neutral-600">Merchant Address</p>
              <div className="p-4 bg-white rounded-xl">
                <div className="flex gap-2 items-center break-all">
                  <span className="text-base font-medium text-neutral-800">
                    {address}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-500">Address copied!</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-neutral-600">
            Please connect your wallet to receive KESC
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="p-6">
        <button
          onClick={() => setStep("amount")}
          className="py-4 w-full text-lg font-medium bg-white rounded-full transition-colors text-neutral-800 hover:bg-neutral-50"
        >
          Edit Amount
        </button>
      </div>
    </div>
  );

  return (
    <ActionSheet
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStep("amount");
        setAmount("");
        queryClient.invalidateQueries();
      }}
      title={step === "amount" ? "Enter Amount" : "Receive KESC"}
    >
      {step === "amount" ? renderNumberPad() : renderQRCode()}
    </ActionSheet>
  );
};

export default ReceiveActionSheet;
