import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useToastStore from "../store/useToastStore";
import useAuthStore from "../store/useAuthStore";

const API_BASE_URL = "https://chaewonp2005.pythonanywhere.com";

const getImageUrl = (photo) => {
  if (!photo) {
    return "/images/camera.jpg";
  }

  if (photo.startsWith("http")) {
    return photo;
  }

  return `${API_BASE_URL}${photo}`;
};

const getRentableDays = (body) => {
  const matched = body?.match(/(\d+)일/);
  return matched ? Number(matched[1]) : 0;
};

const getItemDescription = (body) => {
  if (!body) {
    return "등록된 설명이 없습니다.";
  }

  const description = body
    .replace(/대여\s*가능\s*기간\s*[:：]?\s*\d+일/g, "")
    .replace(/대여가능기간\s*[:：]?\s*\d+일/g, "")
    .replace(/대여기간\s*[:：]?\s*\d+일/g, "")
    .trim();

  return description || "등록된 설명이 없습니다.";
};

const formatDate = (dateString) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const HomeButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/home")}
      className={`flex h-[32px] w-[32px] cursor-pointer items-center justify-center outline-none focus:ring-0 focus:outline-none ${className}`}
      aria-label="홈으로 이동"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 10.8L12 4L20 10.8V20H14.5V14.5H9.5V20H4V10.8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

function Items() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sortOption, setSortOption] = useState(() => {
    const savedSortOption = localStorage.getItem("items-sort-option");
    return ["popular", "recent", "name"].includes(savedSortOption)
      ? savedSortOption
      : "popular";
  });
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [step, setStep] = useState("list");
  const [items, setItems] = useState([]);
  const [isRenting, setIsRenting] = useState(false);

  useEffect(() => {
    localStorage.setItem("items-sort-option", sortOption);
  }, [sortOption]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const itemListUrl = `${API_BASE_URL}/deskresearch/`;
        console.log("물품 전체조회 요청 URL:", itemListUrl);

        const response = await fetch(itemListUrl, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const responseText = await response.text();

        if (!response.ok) {
          console.error("물품 목록 API 실패 응답:", responseText);
          throw new Error("물품 목록 API 요청에 실패했습니다.");
        }

        const data = JSON.parse(responseText);
        console.log("물품 전체조회 응답:", data);

        if (!Array.isArray(data)) {
          throw new Error("물품 목록 응답이 배열 형식이 아닙니다.");
        }

        const mappedItems = data.map((item) => {
          const records = Array.isArray(item.records) ? item.records : [];
          const hasActiveRental = records.some((record) =>
            ["1", "3"].includes(String(record.record_text)),
          );

          return {
            id: item.id,
            name: item.title,
            rentableDays: getRentableDays(item.body),
            returnDate: formatDate(item.date),
            description: getItemDescription(item.body),
            image: getImageUrl(item.photo),
            isAvailable: Number(item.rental) === 1 && !hasActiveRental,
            rentalCount: records.length,
            createdAt: item.date,
          };
        });

        setItems(mappedItems);
      } catch (error) {
        console.error("물품 목록을 불러오지 못했습니다.", error);
      }
    };

    getItems();
  }, [user?.token]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (showAvailableOnly) {
      result = result.filter((item) => item.isAvailable);
    }

    if (sortOption === "popular") {
      result.sort((a, b) => b.rentalCount - a.rentalCount);
    }

    if (sortOption === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sortOption === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    return result;
  }, [items, showAvailableOnly, sortOption]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  useEffect(() => {
    if (step === "done" && selectedItem) {
      showToast(`[${selectedItem.name}]이 대여 완료되었습니다.`);
      navigate("/home");
    }
  }, [step, selectedItem, navigate, showToast]);

  const handleRentConfirm = async () => {
    if (!selectedItem || isRenting) {
      return;
    }

    try {
      setIsRenting(true);

      const headers = {
        "Content-Type": "application/json",
      };

      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const response = await fetch(`${API_BASE_URL}/deskresearch/records/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          post: selectedItem.id,
          record_text: 1,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("대여하기 API 실패 응답:", responseText);
        throw new Error("대여하기 API 요청에 실패했습니다.");
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedItem.id ? { ...item, isAvailable: false } : item,
        ),
      );
      setStep("done");
    } catch (error) {
      console.error("대여하기에 실패했습니다.", error);
      showToast("대여하기에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsRenting(false);
    }
  };

  if (step === "confirm" && selectedItem) {
    return (
      <main className="relative mx-auto h-[874px] w-[402px] overflow-hidden bg-white">
        <div className="absolute top-0 left-0 h-[230px] w-full bg-gradient-to-b from-[#F4F8FF] to-white" />
        <HomeButton className="absolute top-[24px] right-[24px] text-[var(--color-main-2)]" />

        <section className="relative pt-[164px]">
          <div className="mx-auto h-[214px] w-[214px] overflow-hidden rounded-[24px] bg-[#EEF3FB] shadow-sm">
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="relative mx-auto mt-[40px] flex h-[215px] w-[320px] flex-col items-center rounded-[24px] bg-[#F4F8FF] px-[20px] pt-[43px] shadow-sm">
          <p className="text-center text-[20px] font-semibold text-[#020913]">
            {selectedItem.name}을 대여하시겠습니까?
          </p>

          <p className="mt-[18px] text-[15px] font-normal text-[#020913]">
            반납 일자: {year}.{String(month).padStart(2, "0")}.
            {String(date).padStart(2, "0")}
          </p>

          <div className="mt-[43px] flex gap-[27px]">
            <button
              type="button"
              onClick={() => setStep("detail")}
              className="h-[43px] w-[123px] rounded-[22px] border border-[var(--color-main-2)] bg-white text-[15px] font-semibold text-[#020913] outline-none focus:ring-0 focus:outline-none"
            >
              취소
            </button>

            <button
              type="button"
              onClick={handleRentConfirm}
              disabled={isRenting}
              className="h-[43px] w-[123px] rounded-[22px] bg-[var(--color-main-2)] text-[15px] font-semibold text-white outline-none focus:ring-0 focus:outline-none disabled:opacity-60"
            >
              {isRenting ? "처리중" : "확인"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (step === "detail" && selectedItem) {
    return (
      <main className="mx-auto min-h-[874px] w-[402px] overflow-hidden bg-white pb-[120px]">
        <header className="flex h-[49px] w-full items-center justify-between bg-[var(--color-main-2)] px-[26px]">
          <button
            type="button"
            onClick={() => setStep("list")}
            className="text-[28px] leading-none font-light text-[#F4F8FF] outline-none focus:ring-0 focus:outline-none"
          >
            ‹
          </button>

          <HomeButton className="text-[#F4F8FF]" />
        </header>

        <section className="px-[37px] pt-[32px]">
          <div className="mx-auto h-[287px] w-[287px] overflow-hidden rounded-[24px] bg-[#EEF3FB] shadow-sm">
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mx-auto mt-[27px] flex w-[287px] items-center justify-between gap-[16px]">
            <h2 className="min-w-0 truncate text-[24px] leading-none font-semibold text-[#020913]">
              {selectedItem.name}
            </h2>

            {selectedItem.rentableDays > 0 && (
              <p className="flex h-[28px] shrink-0 items-center rounded-[14px] bg-[#F4F8FF] px-[12px] text-[13px] leading-none font-medium text-[var(--color-main-2)]">
                {selectedItem.rentableDays}일 대여
              </p>
            )}
          </div>

          <div className="mx-auto mt-[26px] min-h-[112px] w-[287px] rounded-[18px] bg-[#F8FAFF] px-[18px] py-[16px] text-[15px] leading-[26px] font-normal text-[#707070]">
            <p className="whitespace-pre-line">{selectedItem.description}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!selectedItem.isAvailable) {
                showToast("현재 대여할 수 없는 물품입니다.");
                return;
              }

              setStep("confirm");
            }}
            className={`mx-auto mt-[122px] flex h-[43px] w-[150px] items-center justify-center rounded-[22px] text-[15px] font-semibold outline-none focus:ring-0 focus:outline-none ${
              selectedItem.isAvailable
                ? "bg-[var(--color-main-2)] text-white"
                : "bg-[#B3B3B3] text-white"
            }`}
          >
            {selectedItem.isAvailable ? "대여하기" : "대여불가"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-[874px] w-[402px] overflow-hidden bg-white pb-[90px]">
      <div className="absolute top-0 left-0 h-[206px] w-full bg-gradient-to-b from-[#F4F8FF] to-white" />
      <HomeButton className="absolute top-[78px] right-[40px] z-30 text-[var(--color-main-2)]" />

      <section className="relative ml-[40px] pt-[78px]">
        <h1 className="text-[26px] font-bold text-black">물품 목록</h1>
      </section>

      <div className="relative mt-[24px] ml-[40px] flex w-[322px] items-center justify-between">
        <button
          onClick={() => setShowAvailableOnly((prev) => !prev)}
          className={`flex h-[34px] w-[92px] items-center justify-center rounded-[30px] border text-[15px] font-medium shadow-sm outline-none focus:ring-0 focus:outline-none ${
            showAvailableOnly
              ? "border-[var(--color-main-2)] bg-[var(--color-main-2)] text-white"
              : "border-[#DDE7F7] bg-white text-[#020913]"
          }`}
        >
          대여가능
        </button>

        <div className="relative z-20">
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="flex h-[40px] w-[140px] overflow-hidden rounded-[10px] border border-[#204470] bg-white text-[15px] font-normal text-black shadow-sm outline-none focus:ring-0 focus:outline-none"
          >
            <span className="flex h-full w-[100px] items-center justify-center">
              {sortOption === "popular"
                ? "대여 많은 순"
                : sortOption === "recent"
                  ? "최신 등록 순"
                  : "가나다 순"}
            </span>
            <span className="flex h-full w-[40px] items-center justify-center bg-[#204470] text-white">
              {isSortOpen ? (
                <img
                  src="/icons/up_arrow.svg"
                  alt="드롭다운 닫기"
                  className="h-[14px] w-[14px] object-contain"
                />
              ) : (
                <img
                  src="/icons/down_arrow.svg"
                  alt="드롭다운 열기"
                  className="h-[14px] w-[14px] object-contain"
                />
              )}
            </span>
          </button>

          {isSortOpen && (
            <div className="absolute top-[40px] left-0 w-[100px] border-x border-b border-[#204470] bg-white text-[16px] font-normal text-black">
              {[
                { value: "popular", label: "대여 많은 순" },
                { value: "recent", label: "최신 등록 순" },
                { value: "name", label: "가나다 순" },
              ]
                .filter((option) => option.value !== sortOption)
                .map((option, index, array) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortOption(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`h-[40px] w-full pl-[10px] text-left outline-none focus:ring-0 focus:outline-none ${
                      index !== array.length - 1
                        ? "border-b border-[#D9D9D9]"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-[20px] ml-[40px] grid w-[322px] grid-cols-2 gap-x-[15px] gap-y-[30px]">
        {filteredAndSortedItems.map((item) => (
          <div key={item.id} className="w-[153px]">
            <button
              type="button"
              onClick={() => {
                setSelectedItem(item);
                setStep("detail");
              }}
              className="h-[153px] w-[153px] overflow-hidden rounded-[18px] bg-[#EEF3FB] shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </button>

            <div className="mt-[10px] flex items-center justify-between gap-[6px] rounded-[14px] bg-white px-[2px]">
              <div className="max-w-[78px] min-w-0">
                <p className="truncate text-[16px] leading-none font-semibold text-[#020913]">
                  {item.name}
                </p>

                <p className="mt-[7px] text-[12px] leading-none font-normal text-[#020913]">
                  {item.returnDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!item.isAvailable) {
                    showToast("현재 대여할 수 없는 물품입니다.");
                    return;
                  }

                  setSelectedItem(item);
                  setStep("confirm");
                }}
                className={`h-[31px] w-[67px] shrink-0 rounded-[16px] border text-[13px] font-medium shadow-sm transition outline-none focus:ring-0 focus:outline-none active:translate-y-[1px] ${
                  item.isAvailable
                    ? "border-[var(--color-main-2)] bg-[var(--color-main-2)] text-white"
                    : "border-[#B3B3B3] bg-[#B3B3B3] text-white"
                }`}
              >
                {item.isAvailable ? "대여하기" : "대여불가"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Items;
