import { create } from "zustand";

const useToastStore = create((set) => ({
  text: "",
  isOpen: false,

  showToast: (text) =>
    set({
      text,
      isOpen: true,
    }),

  closeToast: () =>
    set({
      text: "",
      isOpen: false,
    }),
}));

export default useToastStore;
