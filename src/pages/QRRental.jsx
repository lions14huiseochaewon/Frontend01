import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useToastStore from "../store/useToastStore";
import Home from "./Home";
import Items from "./Items";
import MyPage from "./MyPage";

function QRRental() {
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundPath =
    location.state?.backgroundPath ||
    sessionStorage.getItem("qrBackgroundPath") ||
    "/home";
  const [step, setStep] = useState("select");
  const showToast = useToastStore((state) => state.showToast);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const renderBackgroundPage = () => {
    if (backgroundPath.startsWith("/items")) {
      return <Items />;
    }

    if (backgroundPath.startsWith("/mypage")) {
      return <MyPage />;
    }

    return <Home />;
  };

  const handleCancel = () => {
    navigate(backgroundPath);
  };

  useEffect(() => {
    if (step === "done") {
      showToast("[물품명]이 대여 완료되었습니다.");
      navigate("/home");
    }
  }, [step, navigate, showToast]);

  if (step === "select") {
    return (
      <main className="relative mx-auto h-[874px] w-[402px] overflow-hidden">
        <div className="pointer-events-none">{renderBackgroundPage()}</div>

        <div className="absolute inset-0 z-40 bg-black/20" />

        <div className="fixed bottom-[101px] left-1/2 z-[100] h-[87px] w-[377px] -translate-x-1/2 rounded-[10px] bg-[#F7F7F7]">
          <div>
            <button
              type="button"
              onClick={() => setStep("confirm")}
              className="h-[43px] w-full text-[15px] font-normal text-black"
            >
              사진 찍기
            </button>

            <div className="h-[0.3px] w-full bg-[#D9D9D9]" />
          </div>

          <label className="flex h-[43px] w-full cursor-pointer items-center justify-center text-[15px] font-normal text-black">
            사진 보관함
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files[0];

                if (file) {
                  setStep("confirm");
                }
              }}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="fixed bottom-[30px] left-1/2 z-[100] h-[57px] w-[377px] -translate-x-1/2 rounded-[10px] bg-[#F7F7F7] text-[15px] font-normal text-black"
        >
          취소
        </button>
      </main>
    );
  }

  if (step === "confirm") {
    return (
      <main className="mx-auto h-[874px] w-[402px] bg-white">
        <section className="pt-[190px]">
          <div className="mx-auto flex h-[202px] w-[202px] items-center justify-center bg-[#838383] text-[15px] font-medium text-black">
            사진
          </div>
        </section>

        <section className="mx-auto mt-[52px] flex h-[215px] w-[300px] flex-col items-center rounded-[20px] bg-[#F4F8FF] pt-[47px]">
          <p className="text-[20px] font-semibold text-[#020913]">
            [물품명] 을 대여하시겠습니까?
          </p>

          <p className="mt-[18px] text-[16px] font-normal text-[#020913]">
            반납 일자: {year}.{String(month).padStart(2, "0")}.
            {String(date).padStart(2, "0")}
          </p>

          <div className="mt-[43px] flex gap-[27px]">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="h-[43px] w-[123px] rounded-[22px] border border-[var(--color-main-2)] bg-[#F4F8FF] text-[15px] font-semibold text-[#020913] outline-none focus:ring-0 focus:outline-none"
            >
              취소
            </button>

            <button
              type="button"
              onClick={() => setStep("done")}
              className="h-[43px] w-[123px] rounded-[22px] bg-[var(--color-main-2)] text-[15px] font-semibold text-white outline-none focus:ring-0 focus:outline-none"
            >
              확인
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (step === "done") {
    return (
      <main>
        <p>(물품명)이 대여 완료되었습니다.</p>
      </main>
    );
  }
}

export default QRRental;
