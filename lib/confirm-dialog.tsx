import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "default",
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const ConfirmDialog = useCallback(() => {
    if (!state.isOpen) return null;

    return (
      <Dialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle id="confirm-dialog-title">{state.title}</DialogTitle>
            <DialogClose onClose={handleCancel} />
          </DialogHeader>
          <DialogBody>
            <p className="text-slate-600" id="confirm-dialog-description">
              {state.message}
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {state.cancelText}
            </Button>
            <Button
              variant={state.variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {state.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [state, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog };
}
