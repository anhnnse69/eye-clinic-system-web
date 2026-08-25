"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, CheckCircle, X, ShieldCheck, UserPlus,
} from "lucide-react";

import { useTranslations } from "next-intl";

export default function ConfirmPortalDialog({
    isOpen,
    onClose,
    onConfirm,
    submitting,
    patientName,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    submitting: boolean;
    patientName: string;
  }) {
    const t = useTranslations("common.confirmPortal");
    const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);
  
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => { document.body.style.overflow = ""; };
    }, [isOpen]);
  
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen && !submitting) onClose();
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, submitting, onClose]);
  
    if (!mounted) return null;
  
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{ margin: 0, padding: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => !submitting && onClose()}
            />
  
            {/* Dialog */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-10 w-full mx-4"
              style={{ maxWidth: "480px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-primary-container/20 to-primary/10 rounded-3xl blur-xl" />

              <div className="relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl border border-outline-variant">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-primary-container via-primary to-primary-container" />

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="absolute top-4 right-4 p-1.5 text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container rounded-lg transition-all disabled:opacity-40"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Icon */}
                  <div className="flex items-center gap-4 mb-1">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-xs">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-tertiary-container/20 rounded-full flex items-center justify-center border-2 border-surface-container-lowest">
                        <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-on-surface leading-tight">
                        {t("title")}
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {t("subtitle")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-outline-variant/40 mx-6" />

                {/* Content */}
                <div className="px-6 py-5 space-y-4">
                  {/* Info card */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                        {t("patientLabel")}
                      </p>
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {patientName || "—"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {t("warning")}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex items-center gap-3">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                  <motion.button
                    onClick={onConfirm}
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.97 }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-on-primary bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t("processing")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t("confirm")}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }