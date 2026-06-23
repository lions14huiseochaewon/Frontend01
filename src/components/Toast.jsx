import { useEffect } from "react";
import useToastStore from "../store/useToastStore";

function Toast() {
  const text = useToastStore((state) => state.text);
  const isOpen = useToastStore((state) => state.isOpen);
  const closeToast = useToastStore((state) => state.closeToast);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      closeToast();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, closeToast]);

  if (!isOpen) return null;

  return (
    <div className="toast-fade fixed top-[32px] left-1/2 z-[999] flex h-[60px] w-[360px] -translate-x-1/2 items-center rounded-[10px] bg-[#222222] px-[21px] text-[15px] font-normal text-white">
      {text}
    </div>
  );
}

export default Toast;
