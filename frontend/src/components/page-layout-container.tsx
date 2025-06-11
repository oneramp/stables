import WalletGuard from "@/components/wallet-guard";

export default function PageLayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletGuard>
      <div className="h-screen bg-[#1A2027] flex items-center justify-center  relative ">
        <div className="w-full md:w-[26%] bg-slate-100 md:rounded-[20px] overflow-hidden md:h-[90%] overflow-y-auto h-full ">
          {children}
        </div>
      </div>
    </WalletGuard>
  );
}
