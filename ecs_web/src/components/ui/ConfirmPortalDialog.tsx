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
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl" />
  
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600" />
  
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-40"
                  >
                    <X className="w-4 h-4" />
                  </button>
  
                  {/* Icon */}
                  <div className="flex items-center gap-4 mb-1">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-sm">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {t("title")}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t("subtitle")}
                      </p>
                    </div>
                  </div>
                </div>
  
                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6" />
  
                {/* Content */}
                <div className="px-6 py-5 space-y-4">
                  {/* Info card */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-0.5">
                        {t("patientLabel")}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {patientName || "—"}
                      </p>
                    </div>
                  </div>
  
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t("warning")}
                  </p>
                </div>
  
                {/* Footer */}
                <div className="px-6 pb-6 flex items-center gap-3">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                  <motion.button
                    onClick={onConfirm}
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.97 }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                    style={{
                      background: submitting
                        ? "#93c5fd"
                        : "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                    }}
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