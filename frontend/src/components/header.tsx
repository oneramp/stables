import Image from "next/image";
import { Badge } from "./ui/badge";

const Header = () => {
  return (
    <div className="px-5 flex justify-between items-center bg-white py-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Image src="/oneramp.svg" alt="logo" width={90} height={32} />
        </div>
        <Badge variant="default" className="bg-blue-500">
          BETA
        </Badge>
      </div>
      <appkit-account-button balance="hide" />
    </div>
  );
};

export default Header;
