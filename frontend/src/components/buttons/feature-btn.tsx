import { Card } from "@/components/ui/card";

const FeatureBtn = ({
  title,
  Icon,
  onClick,
}: {
  title: string;
  Icon: React.ElementType;
  onClick: () => void;
}) => {
  return (
    <Card
      className="flex flex-col gap-4 justify-center items-center p-2 w-full h-24 bg-white cursor-pointer"
      onClick={onClick}
    >
      <Icon className="text-primary size-8" />
      <span className="text-xs font-semibold">{title}</span>
    </Card>
  );
};

export default FeatureBtn;
