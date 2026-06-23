import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function NavigationBarLayout() {
  const location = useLocation();
  const [isQrMenuOpen, setIsQrMenuOpen] = useState(false);

  const isItemsPage = location.pathname === "/items";
  const isMyPage = location.pathname === "/mypage";

  return (
    <>
      {isQrMenuOpen && (
        <>
          <button
            type="button"
            aria-label="QR 메뉴 닫기"
            onClick={() => setIsQrMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/20"
          />

          <div className="fixed bottom-[170px] left-1/2 z-[100] flex w-[377px] -translate-x-1/2 flex-col overflow-hidden rounded-[10px] bg-[#F7F7F7]">
            <label className="relative flex h-[57px] w-full cursor-pointer items-center justify-center border-b border-[#E2E2E2] bg-[#F7F7F7] text-[15px] font-normal text-black">
              사진 찍기
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    setIsQrMenuOpen(false);
                  }
                }}
              />
            </label>

            <label className="relative flex h-[57px] w-full cursor-pointer items-center justify-center bg-[#F7F7F7] text-[15px] font-normal text-black">
              사진 보관함
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    setIsQrMenuOpen(false);
                  }
                }}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setIsQrMenuOpen(false)}
            className="fixed bottom-[100px] left-1/2 z-[100] h-[57px] w-[377px] -translate-x-1/2 rounded-[10px] bg-[#F7F7F7] text-[15px] font-normal text-black"
          >
            취소
          </button>
        </>
      )}

      <nav className="fixed bottom-0 left-1/2 z-50 flex h-[66px] w-[402px] -translate-x-1/2 items-end justify-between rounded-t-[20px] bg-[#F4F8FF] px-[36px]">
        <NavLink
          to="/items"
          className="flex h-full w-[80px] translate-y-[8px] items-center justify-center"
        >
          <img
            src={
              isItemsPage ? "/icons/items-blue.svg" : "/icons/items-gray.svg"
            }
            alt="물품 대여"
            className="w-[40px] object-contain"
          />
        </NavLink>

        <button
          type="button"
          onClick={() => setIsQrMenuOpen(true)}
          className="relative flex h-[91px] w-[113px] translate-y-[8px] items-center justify-center rounded-[50%] bg-[#F4F8FF]"
        >
          <img
            src="/icons/qr.svg"
            alt="QR 대여"
            className="w-[33px] object-contain pb-[10px]"
          />
        </button>

        <NavLink
          to="/mypage"
          className="flex h-full w-[80px] translate-y-[8px] items-center justify-center"
        >
          <img
            src={isMyPage ? "/icons/mypage-blue.svg" : "/icons/mypage-gray.svg"}
            alt="마이페이지"
            className="w-[55px] object-contain"
          />
        </NavLink>
      </nav>
    </>
  );
}

export default NavigationBarLayout;
