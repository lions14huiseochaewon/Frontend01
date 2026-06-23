import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "사용자";

  const itemListUrl = "https://chaewonp2005.pythonanywhere.com/deskresearch/";
  const imageBaseUrl = "https://chaewonp2005.pythonanywhere.com";

  const [availableItems, setAvailableItems] = useState([]);
  const [myRentals, setMyRentals] = useState([]);

  const getImageUrl = (photo) => {
    if (!photo) return "";
    if (photo.startsWith("http")) return photo;
    return `${imageBaseUrl}${photo}`;
  };

  const getRentableDays = (body) => {
    const match = String(body || "").match(/(\d+)일/);
    return match ? Number(match[1]) : 0;
  };

  const getDueDateText = (createdAt, rentableDays) => {
    if (!createdAt) return "-";

    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + rentableDays);

    const year = String(dueDate.getFullYear()).slice(2);
    const month = String(dueDate.getMonth() + 1).padStart(2, "0");
    const date = String(dueDate.getDate()).padStart(2, "0");

    return `${year}${month}${date}`;
  };

  const getLatestRecord = (records) => {
    if (!Array.isArray(records) || records.length === 0) return null;

    return [...records].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )[0];
  };

  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const getAvailableItems = async () => {
      try {
        const response = await fetch(itemListUrl);

        if (!response.ok) {
          throw new Error("홈 대여 가능 물품 API 요청에 실패했습니다.");
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data
          : data.results || data.data || [];

        const mappedItems = items
          .filter((item) => item.rental === 1)
          .map((item) => ({
            id: item.id,
            name: item.title,
            image: getImageUrl(item.photo),
          }));

        setAvailableItems(mappedItems);

        const currentUserCandidates = [
          user?.username,
          user?.email,
          user?.email?.split("@")[0],
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        const myRentals = items
          .map((item) => {
            const rentableDays = getRentableDays(item.body);
            const myRecords = Array.isArray(item.records)
              ? item.records.filter((record) =>
                  currentUserCandidates.includes(
                    String(record.username).toLowerCase(),
                  ),
                )
              : [];
            const latestRecord = getLatestRecord(myRecords);
            const dueDate = latestRecord?.created_at
              ? new Date(latestRecord.created_at)
              : null;

            if (dueDate) {
              dueDate.setDate(dueDate.getDate() + rentableDays);
            }

            return {
              id: item.id,
              name: item.title,
              dueDate: getDueDateText(latestRecord?.created_at, rentableDays),
              dueDateTime: dueDate
                ? dueDate.getTime()
                : Number.MAX_SAFE_INTEGER,
              latestRecord,
            };
          })
          .filter((item) =>
            ["1", "3"].includes(String(item.latestRecord?.record_text)),
          )
          .sort((a, b) => a.dueDateTime - b.dueDateTime);

        setMyRentals(myRentals);
      } catch (error) {
        console.error("홈 대여 가능 물품을 불러오지 못했습니다.", error);
      }
    };

    getAvailableItems();
  }, [user?.email, user?.username]);
  const visibleItems = availableItems.slice(scrollIndex, scrollIndex + 3);

  return (
    <main className="relative mx-auto min-h-[874px] w-[402px] bg-white pb-[110px]">
      <div className="absolute top-0 left-0 h-[286px] w-full bg-gradient-to-b from-[#F4F8FF] to-white" />

      <section className="relative px-[36px] pt-[118px]">
        <div className="flex flex-col items-center">
          <img src="/icons/Believe.svg" className="w-[165px]" />

          <p className="mt-[18px] text-center text-[15px] leading-[22px] font-normal text-[#020913]">
            <span className="font-semibold">{displayName}</span> 님,
            <br />
            오늘도 필요한 물품을 빌려보세요!
          </p>
        </div>
      </section>

      <section className="relative mt-[74px] px-[36px]">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#020913]">
              대여 가능 물품
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/items")}
            className="text-[11px] font-medium text-[var(--color-main-2)]"
          >
            전체보기
          </button>
        </div>

        <div className="mt-[16px] flex items-center gap-[10px]">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate("/items")}
              className="w-[98px] text-left"
            >
              <div className="h-[98px] w-[98px] overflow-hidden rounded-[18px] bg-[#EEF3FB] shadow-sm">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center px-[8px] text-center text-[12px] text-[#707070]">
                    {item.name}
                  </span>
                )}
              </div>

              <p className="mt-[8px] truncate text-[12px] font-medium text-[#020913]">
                {item.name}
              </p>
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setScrollIndex((prev) =>
                prev + 3 >= availableItems.length ? 0 : prev + 3,
              )
            }
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--color-main-2)] pb-[2px] text-[18px] leading-none font-light text-white shadow-sm"
          >
            ›
          </button>
        </div>
      </section>

      <section className="relative mt-[56px] px-[36px]">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#020913]">
              나의 대여상태
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="text-[11px] font-medium text-[var(--color-main-2)]"
          >
            자세히
          </button>
        </div>

        <div className="mt-[16px] flex flex-col gap-[10px] pr-[2px]">
          {myRentals.length > 0 ? (
            myRentals.map((rental) => (
              <button
                key={`${rental.id}-${rental.latestRecord?.id || "record"}`}
                onClick={() => navigate("/mypage")}
                className="flex min-h-[78px] w-full items-center justify-between rounded-[18px] bg-[#F4F8FF] px-[16px] shadow-sm"
              >
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-[8px]">
                    <span className="max-w-[170px] truncate text-[15px] font-semibold text-[#020913]">
                      {rental.name}
                    </span>

                    <span className="flex h-[20px] w-[52px] items-center justify-center rounded-[13px] bg-[var(--color-main-3)] text-[8px] font-normal text-white">
                      {String(rental.latestRecord?.record_text) === "3"
                        ? "연체"
                        : "대여중"}
                    </span>
                  </div>

                  <p className="mt-[6px] text-[12px] leading-[18px] text-[#545454]">
                    <span className="font-light">반납일자 | </span>
                    <span className="font-medium">{rental.dueDate}</span>
                  </p>
                </div>

                <span className="text-[20px] font-light text-[var(--color-main-2)]">
                  ›
                </span>
              </button>
            ))
          ) : (
            <button
              onClick={() => navigate("/mypage")}
              className="flex h-[78px] w-full items-center rounded-[18px] bg-[#F4F8FF] px-[16px] shadow-sm"
            >
              <p className="text-[14px] font-light text-[#707070]">
                현재 대여 중인 물품이 없습니다.
              </p>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;
