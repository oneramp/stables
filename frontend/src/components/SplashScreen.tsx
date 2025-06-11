import Image from "next/image";
import { ConnectButton } from "./ConnectButton";

export function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Image
            src="/reown.svg"
            alt="Reown"
            width={180}
            height={180}
            priority
            className="mb-8"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome to Reown
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Connect your wallet to continue
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <ConnectButton />
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          By connecting your wallet, you agree to our Terms of Service and
          Privacy Policy
        </p>
      </div>
    </div>
  );
}
