"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { AdminNewEnquiryForm } from "@/components/enquiry/AdminNewEnquiryForm";

interface AdminNewEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (enquiryId: string, enquiryNumber: string) => void;
}

export function AdminNewEnquiryModal({
  isOpen,
  onClose,
  onSuccess
}: AdminNewEnquiryModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Admission Enquiry Intake (360° Lead Master)"
    >
      <div className="max-h-[82vh] overflow-y-auto pr-1">
        <AdminNewEnquiryForm
          isModal={true}
          onCancel={onClose}
          onSuccess={(id, num) => {
            if (onSuccess) onSuccess(id, num);
          }}
        />
      </div>
    </Modal>
  );
}
