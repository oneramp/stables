"use client";
import FeatureBtn from "@/components/buttons/feature-btn";
import { FaCircleArrowDown, FaCircleArrowRight } from "react-icons/fa6";
import { FaCircleArrowUp } from "react-icons/fa6";
import React, { useState } from "react";
import ReceiveActionSheet from "@/components/receive-action-sheet";
import PayBillActionSheet from "@/components/paybill-action-sheet";

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
