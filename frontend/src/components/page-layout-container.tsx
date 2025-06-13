import MainTabs from "./main-tabs";
import Header from "./header";
import WalletGuard from "./wallet-guard";

interface PageLayoutContainerProps {
  children: React.ReactNode;
}

const PageLayoutContainer = ({ children }: PageLayoutContainerProps) => {
  return (
    <WalletGuard>
      <div className="fixed inset-0 bg-[#1A2027] flex items-center justify-center">
        <div className="relative w-full md:w-[26%] h-full md:h-[90%] md:rounded-[36px] bg-slate-100 flex flex-col">
          {/* Main Content Area with proper z-index */}
          <div className="overflow-y-auto relative z-0 flex-1">
            <Header />
            {children}
          </div>

          {/* Fixed Bottom Navigation with higher z-index */}
          <MainTabs />
        </div>
      </div>
    </WalletGuard>
  );
};

export default PageLayoutContainer;
