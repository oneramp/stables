"use client";
import FeatureBtn from "@/components/buttons/feature-btn";
import PayBillActionSheet from "@/components/paybill-action-sheet";
import ReceiveActionSheet from "@/components/receive-action-sheet";
import { useState } from "react";
import { FaCircleArrowDown, FaCircleArrowUp } from "react-icons/fa6";

const PayFeatureCards = () => {
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPayBillOpen, setIsPayBillOpen] = useState(false);

  return (
    <>
      <FeatureBtn
        title="Receive"
        Icon={FaCircleArrowDown}
        onClick={() => setIsReceiveOpen(true)}
      />
      <FeatureBtn
        title="Pay Bill"
        Icon={FaCircleArrowUp}
        onClick={() => setIsPayBillOpen(true)}
      />

      <ReceiveActionSheet
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
      />

      <PayBillActionSheet
        isOpen={isPayBillOpen}
        onClose={() => setIsPayBillOpen(false)}
      />
    </>
  );
};

export default PayFeatureCards;
