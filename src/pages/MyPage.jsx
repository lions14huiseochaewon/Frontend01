import { useEffect, useMemo, useRef, useState } from "react";
import useToastStore from "../store/useToastStore";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://chaewonp2005.pythonanywhere.com";

const COLLEGE_LABELS = {
  humanities: "인문과학대학",
  social_sciences: "사회과학대학",
  natural_sciences: "자연과학대학",
  engineering: "공과대학",
  artificial_intelligence: "인공지능대학",
  music: "음악대학",
  art_design: "조형예술대학",
  education: "사범대학",
  business: "경영대학",
  convergence: "신산업융합대학",
  medicine: "의과대학",
  nursing: "간호대학",
  pharmacy: "약학대학",
  scranton: "스크랜튼대학",
  hokma: "호크마교양대학",
  etc: "기타",
};

const getCollegeLabel = (college) => {
  return COLLEGE_LABELS[college] || college || "학과 정보 없음";
};

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
    return "";
  }

  return body
    .replace(/대여\s*가능\s*기간\s*[:：]?\s*\d+일/g, "")
    .replace(/대여가능기간\s*[:：]?\s*\d+일/g, "")
    .replace(/대여기간\s*[:：]?\s*\d+일/g, "")
    .trim();
};

const getDateText = (dateString, rentableDays = 0) => {
  if (!dateString) {
    return "반납일 미정";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "반납일 미정";
  }

  if (rentableDays > 0) {
    date.setDate(date.getDate() + rentableDays);
  }

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const getLatestRecord = (records) => {
  if (!Array.isArray(records) || records.length === 0) {
    return null;
  }
  return [...records].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
};

const getRecordStatus = (recordText) => {
  if (String(recordText) === "1") {
    return "대여중";
  }
  if (String(recordText) === "2") {
    return "반납완료";
  }
  if (String(recordText) === "3") {
    return "연체";
  }
  return "대여중";
};

const HomeButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/home")}
      className={`flex h-[32px] w-[32px] items-center justify-center outline-none focus:ring-0 focus:outline-none ${className}`}
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

function MyPage() {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mode, setMode] = useState("user");
  const [step, setStep] = useState("userMain");
  const [selectedRental, setSelectedRental] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAdminItem, setSelectedAdminItem] = useState(null);
  const [isSavingAdminItem, setIsSavingAdminItem] = useState(false);
  const [adminEditBackStep, setAdminEditBackStep] = useState("adminMain");
  const [userRentals, setUserRentals] = useState([]);
  const [adminItems, setAdminItems] = useState([]);
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("mypage-profile-image") || "";
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileFileInputRef = useRef(null);

  const userProfile = {
    department: getCollegeLabel(
      user?.college || user?.department || user?.major,
    ),
    name:
      user?.name || user?.username || user?.email?.split("@")[0] || "사용자",
    studentId: user?.studentId || user?.student_id || "",
    overdueCount: userRentals.filter(
      (rental) => String(rental.latestRecord?.record_text) === "3",
    ).length,
    role: user?.isAdmin || user?.is_admin ? "관리자" : "이용자",
    phone: user?.phone || user?.phone_number || "",
  };

  const canAccessAdmin = userProfile.role === "관리자";

  useEffect(() => {
    const getAdminItems = async () => {
      if (!user?.token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/deskresearch/`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const responseText = await response.text();

        if (!response.ok) {
          console.error("관리자 물품 목록 API 실패 응답:", responseText);

          if (response.status === 401) {
            logout();
            showToast("로그인 시간이 만료되었습니다. 다시 로그인해 주세요.");
            navigate("/login");
            return;
          }

          throw new Error("관리자 물품 목록을 불러오지 못했습니다.");
        }

        const data = JSON.parse(responseText);

        if (!Array.isArray(data)) {
          throw new Error("관리자 물품 목록 응답이 배열 형식이 아닙니다.");
        }

        const mappedItems = data.map((item) => ({
          id: item.id,
          name: item.title,
          rentableDays: getRentableDays(item.body),
          description: getItemDescription(item.body),
          image: getImageUrl(item.photo),
          records: Array.isArray(item.records) ? item.records : [],
        }));

        setAdminItems(mappedItems);

        const currentUserCandidates = [
          user?.username,
          user?.email,
          user?.email?.split("@")[0],
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        const mappedUserRentals = data
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

            return {
              id: item.id,
              recordId: latestRecord?.id,
              name: item.title,
              dueDate: getDateText(latestRecord?.created_at, rentableDays),
              image: getImageUrl(item.photo),
              latestRecord,
            };
          })
          .filter((item) =>
            ["1", "3"].includes(String(item.latestRecord?.record_text)),
          );

        setUserRentals(mappedUserRentals);
      } catch (error) {
        console.error("관리자 물품 목록을 불러오지 못했습니다.", error);
      }
    };

    getAdminItems();
  }, [
    logout,
    navigate,
    showToast,
    user?.email,
    user?.id,
    user?.token,
    user?.username,
  ]);

  const adminRecords = useMemo(() => {
    return adminItems
      .flatMap((item) =>
        item.records.map((record) => ({
          id: record.id,
          itemId: item.id,
          userName: record.username || "사용자",
          itemName: item.name,
          rentalDate: getDateText(record.created_at),
          returnDate: getDateText(record.created_at, item.rentableDays),
          status: getRecordStatus(record.record_text),
        })),
      )
      .sort((a, b) => b.id - a.id);
  }, [adminItems]);

  const handleLogout = () => {
    logout();
    showToast("로그아웃되었습니다.");
    navigate("/login");
  };

  const statusCounts = useMemo(() => {
    return {
      대여중: adminRecords.filter((record) => record.status === "대여중")
        .length,
      연체: adminRecords.filter((record) => record.status === "연체").length,
      반납완료: adminRecords.filter((record) => record.status === "반납완료")
        .length,
    };
  }, [adminRecords]);

  const filteredAdminRecords = useMemo(() => {
    if (!selectedStatus) {
      return adminRecords;
    }

    return adminRecords.filter((record) => record.status === selectedStatus);
  }, [adminRecords, selectedStatus]);

  const handleAdminItemChange = (field, value) => {
    setSelectedAdminItem((prev) => ({
      ...prev,
      [field]: field === "rentableDays" && value !== "" ? Number(value) : value,
    }));
  };

  const handleAdminImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (selectedAdminItem?.image?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedAdminItem.image);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedAdminItem((prev) => ({
      ...prev,
      image: previewUrl,
      imageFile: file,
    }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageDataUrl = String(reader.result || "");
      setProfileImage(imageDataUrl);
      localStorage.setItem("mypage-profile-image", imageDataUrl);
      setIsProfileMenuOpen(false);
    };

    reader.readAsDataURL(file);
  };

  const handleResetProfileImage = () => {
    setProfileImage("");
    localStorage.removeItem("mypage-profile-image");
    setIsProfileMenuOpen(false);
  };

  const handleAdminItemSave = async () => {
    if (!selectedAdminItem || isSavingAdminItem) {
      return;
    }

    if (!selectedAdminItem.name?.trim()) {
      showToast("물품명을 입력해 주세요.");
      return;
    }

    if (!selectedAdminItem.imageFile && selectedAdminItem.id === 0) {
      showToast("물품 사진을 선택해 주세요.");
      return;
    }

    try {
      setIsSavingAdminItem(true);

      const formData = new FormData();
      const itemDescription = selectedAdminItem.description?.trim();

      formData.append("title", selectedAdminItem.name);
      formData.append(
        "body",
        `${itemDescription || "등록된 설명이 없습니다."}\n대여가능기간 : ${selectedAdminItem.rentableDays || 0}일`,
      );
      formData.append("rental", 1);

      if (selectedAdminItem.imageFile) {
        formData.append("photo", selectedAdminItem.imageFile);
      }

      const isNewItem = selectedAdminItem.id === 0;
      const response = await fetch(
        isNewItem
          ? `${API_BASE_URL}/deskresearch/`
          : `${API_BASE_URL}/deskresearch/${selectedAdminItem.id}/`,
        {
          method: isNewItem ? "POST" : "PUT",
          headers: user?.token
            ? {
                Authorization: `Bearer ${user.token}`,
              }
            : {},
          body: formData,
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error("관리자 물품 저장 API 실패 응답:", responseText);
        throw new Error("관리자 물품 저장 API 요청에 실패했습니다.");
      }

      const savedItem = responseText ? JSON.parse(responseText) : null;
      const mappedSavedItem = savedItem
        ? {
            id: savedItem.id,
            name: savedItem.title,
            rentableDays: getRentableDays(savedItem.body),
            description: getItemDescription(savedItem.body),
            image: getImageUrl(savedItem.photo),
            records: Array.isArray(savedItem.records) ? savedItem.records : [],
          }
        : selectedAdminItem;

      if (isNewItem) {
        setAdminItems((prev) => [...prev, mappedSavedItem]);
        showToast(`${mappedSavedItem.name}이 등록되었습니다.`);
      } else {
        setAdminItems((prev) =>
          prev.map((item) =>
            item.id === selectedAdminItem.id ? mappedSavedItem : item,
          ),
        );
        showToast(`${mappedSavedItem.name}이 수정되었습니다.`);
      }

      setStep("adminMain");
      setSelectedAdminItem(null);
    } catch (error) {
      console.error("관리자 물품 저장에 실패했습니다.", error);
      showToast("물품 저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSavingAdminItem(false);
    }
  };

  const openAdminPage = () => {
    setMode("admin");
    setStep("adminMain");
    setSelectedRental(null);
    setSelectedStatus("");
    setSelectedAdminItem(null);
  };

  if (mode === "user" && step === "userConfirm" && selectedRental) {
    return (
      <main className="relative mx-auto min-h-screen w-full max-w-[402px] bg-white px-[36px] pt-[36px] pb-[120px]">
        <div className="pointer-events-none opacity-35">
          <section className="mt-[36px] mb-[32px] flex h-[180px] w-[360px] items-center rounded-[30px] bg-[#F4F8FF] px-[21px]">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-[16px]">
                <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full bg-[#DDE7F7]">
                  <img
                    src={profileImage || "/icons/profile.svg"}
                    alt="프로필"
                    className={
                      profileImage
                        ? "h-full w-full object-cover"
                        : "h-[64px] w-[64px]"
                    }
                  />
                </div>

                <div>
                  <p className="text-[12px] font-normal text-[#020913]">
                    {userProfile.department}
                  </p>

                  <p className="mt-[4px] text-[20px] leading-none font-semibold text-[#020913]">
                    {userProfile.name}
                    {userProfile.studentId ? `(${userProfile.studentId})` : ""}
                  </p>

                  <p className="mt-[7px] text-[12px] font-normal text-[#020913]">
                    {userProfile.role}
                  </p>
                </div>
              </div>

              <div className="flex h-[50px] w-[50px] flex-col items-center justify-center rounded-[12px] bg-[var(--color-main-2)] text-white">
                <p className="text-[12px] leading-none font-normal">연체</p>
                <p className="mt-[4px] text-[10px] leading-none font-light">
                  {userProfile.overdueCount}건
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-[18px] text-[20px] font-semibold">
              나의 대여 목록
            </h2>

            <div className="grid grid-cols-2 gap-x-[14px] gap-y-[28px]">
              {userRentals.length === 0 && (
                <p className="col-span-2 text-[14px] font-normal text-[#707070]">
                  현재 대여 중인 물품이 없습니다.
                </p>
              )}
              {userRentals.map((rental) => (
                <div key={rental.id} className="w-full">
                  <div className="aspect-square w-full overflow-hidden bg-[#8C8C8C]">
                    <img
                      src={rental.image}
                      alt={rental.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-[10px] flex items-center justify-between gap-[8px]">
                    <div className="max-w-[78px] min-w-0">
                      <p className="truncate text-[16px] leading-none font-semibold text-[#020913]">
                        {rental.name}
                      </p>

                      <p className="mt-[7px] text-[12px] leading-none font-normal text-[#020913]">
                        {rental.dueDate}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="h-[31px] w-[73px] shrink-0 rounded-[16px] bg-[var(--color-main-2)] text-[14px] font-medium text-white"
                    >
                      반납하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="absolute inset-0 bg-black/20" />

        <section className="fixed top-[290px] left-1/2 z-50 flex h-[249px] w-[370px] -translate-x-1/2 flex-col items-center rounded-[20px] bg-[#EEF4FF] pt-[47px]">
          <p className="text-[20px] font-semibold text-[#020913]">
            [{selectedRental.name}] 을 반납하시겠습니까?
          </p>

          <p className="mt-[18px] text-[15px] font-normal text-[#020913]">
            반납 기한: {selectedRental.dueDate}
          </p>

          <div className="mt-[43px] flex gap-[27px]">
            <button
              type="button"
              onClick={() => {
                setSelectedRental(null);
                setStep("userMain");
              }}
              className="h-[45px] w-[140px] rounded-[22px] border border-[var(--color-main-2)] bg-[#EEF4FF] text-[15px] font-semibold text-[#020913] outline-none focus:ring-0 focus:outline-none"
            >
              취소
            </button>

            <button
              type="button"
              onClick={handleReturnConfirm}
              disabled={isReturning}
              className="h-[45px] w-[140px] rounded-[22px] bg-[var(--color-main-2)] text-[15px] font-semibold text-white outline-none focus:ring-0 focus:outline-none disabled:opacity-60"
            >
              {isReturning ? "처리중" : "확인"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (mode === "admin" && step === "adminStatus") {
    return (
      <main className="relative mx-auto min-h-screen w-full max-w-[402px] bg-white pb-[120px]">
        <div className="absolute top-0 left-0 h-[190px] w-full bg-gradient-to-b from-[#F4F8FF] to-white" />
        <header className="relative z-10 flex h-[49px] w-full items-center justify-between bg-[var(--color-main-2)] px-[37px]">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("");
              setStep("adminMain");
            }}
            className="text-[28px] leading-none font-light text-[#F4F8FF] outline-none focus:ring-0 focus:outline-none"
          >
            ‹
          </button>

          <HomeButton className="text-[#F4F8FF]" />
        </header>

        <section className="relative px-[36px] pt-[33px]">
          <h1 className="text-[24px] font-bold text-[#020913]">
            대여 상세 내역
          </h1>

          <section className="mt-[42px]">
            <div className="flex h-[64px] w-full items-center justify-between rounded-[18px] bg-[var(--color-main-2)] px-[18px] text-white shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedStatus("대여중")}
                className="flex h-[38px] min-w-[90px] flex-col items-center justify-center text-[12px] font-semibold"
              >
                <span>대여중</span>
                <span className="mt-[4px] font-normal">
                  {statusCounts.대여중}건
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("연체")}
                className="flex h-[38px] min-w-[90px] flex-col items-center justify-center text-[12px] font-semibold"
              >
                <span>연체</span>
                <span className="mt-[4px] font-normal">
                  {statusCounts.연체}건
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("반납완료")}
                className="flex h-[38px] min-w-[90px] flex-col items-center justify-center text-[12px] font-semibold"
              >
                <span>반납완료</span>
                <span className="mt-[4px] font-normal">
                  {statusCounts.반납완료}건
                </span>
              </button>
            </div>
          </section>

          <section className="mt-[36px] overflow-hidden rounded-[18px] border border-[#EEF3FB] bg-white shadow-sm">
            <div className="grid h-[58px] grid-cols-[0.9fr_1fr_1fr_1fr_0.9fr] items-center border-b border-[#EEF3FB] bg-[#F8FAFF] text-center text-[13px] font-semibold text-[#020913]">
              <p>사용자</p>
              <p>물품명</p>
              <p>대여일</p>
              <p>반납일자</p>
              <p>상태</p>
            </div>

            <div>
              {filteredAdminRecords.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => {
                    const matchedItem = adminItems.find(
                      (item) => item.id === record.itemId,
                    );

                    setSelectedAdminItem(
                      matchedItem || {
                        id: 0,
                        name: record.itemName,
                        rentableDays: 0,
                        description: "물품 설명",
                      },
                    );
                    setAdminEditBackStep("adminStatus");
                    setStep("adminEdit");
                  }}
                  className="grid h-[62px] w-full grid-cols-[0.9fr_1fr_1fr_1fr_0.9fr] items-center border-b border-[#EEF3FB] text-center text-[11px] font-normal text-[#020913] transition outline-none last:border-b-0 hover:bg-[#F8FAFF] focus:ring-0 focus:outline-none"
                >
                  <p className="truncate px-[4px]">{record.userName}</p>
                  <p className="truncate px-[4px]">{record.itemName}</p>
                  <p className="truncate px-[4px]">{record.rentalDate}</p>
                  <p className="truncate px-[4px]">{record.returnDate}</p>
                  <div className="flex justify-center px-[4px]">
                    <span
                      className={`flex h-[25px] min-w-[58px] items-center justify-center rounded-[13px] px-[8px] text-[10px] font-normal text-white ${
                        record.status === "연체"
                          ? "bg-[#D93636]"
                          : record.status === "반납완료"
                            ? "bg-[#838383]"
                            : "bg-[var(--color-main-3)]"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </section>
      </main>
    );
  }

  if (mode === "admin" && step === "adminEdit" && selectedAdminItem) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[402px] bg-white pb-[120px]">
        <header className="flex h-[49px] w-full items-center justify-between bg-[var(--color-main-2)] px-[37px]">
          <button
            type="button"
            onClick={() => setStep(adminEditBackStep)}
            className="text-[28px] leading-none font-light text-[#F4F8FF] outline-none focus:ring-0 focus:outline-none"
          >
            ‹
          </button>

          <HomeButton className="text-[#F4F8FF]" />
        </header>

        <section className="px-[37px] pt-[32px]">
          <label className="mx-auto block h-[287px] w-[287px] cursor-pointer overflow-hidden bg-[#838383]">
            <input
              type="file"
              accept="image/*"
              onChange={handleAdminImageChange}
              className="hidden"
            />
            {selectedAdminItem.image ? (
              <img
                src={selectedAdminItem.image}
                alt={selectedAdminItem.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[15px] font-medium text-white">
                사진 선택
              </span>
            )}
          </label>

          <div className="mx-auto mt-[27px] flex w-[287px] items-baseline gap-[34px]">
            <input
              id="item-name"
              type="text"
              value={selectedAdminItem.name}
              placeholder="물품명"
              autoComplete="off"
              style={{ backgroundColor: "transparent" }}
              onChange={(event) =>
                handleAdminItemChange("name", event.target.value)
              }
              className="w-[130px] border-0 bg-transparent text-[24px] leading-none font-semibold text-[#707070] outline-none placeholder:text-[#B3B3B3] focus:bg-transparent focus:ring-0 focus:outline-none"
            />

            <div className="flex items-baseline text-[15px] leading-none font-normal text-[#B3B3B3]">
              <span>대여기간&nbsp;</span>
              <input
                id="item-days"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={selectedAdminItem.rentableDays}
                onFocus={(event) => {
                  if (String(selectedAdminItem.rentableDays) === "0") {
                    handleAdminItemChange("rentableDays", "");
                    return;
                  }

                  event.target.select();
                }}
                onBlur={() => {
                  if (selectedAdminItem.rentableDays === "") {
                    handleAdminItemChange("rentableDays", "0");
                  }
                }}
                onChange={(event) => {
                  const onlyNumbers = event.target.value.replace(/[^0-9]/g, "");
                  handleAdminItemChange("rentableDays", onlyNumbers);
                }}
                className="w-[34px] border-0 bg-transparent p-0 text-center text-[15px] leading-none font-normal text-[#707070] outline-none focus:bg-transparent focus:ring-0 focus:outline-none"
              />
              <span>일</span>
            </div>
          </div>

          <div className="mx-auto mt-[34px] w-[287px]">
            <textarea
              id="item-description"
              value={selectedAdminItem.description}
              placeholder="상품 설명을 입력하세요"
              autoComplete="off"
              style={{ backgroundColor: "transparent" }}
              onChange={(event) =>
                handleAdminItemChange("description", event.target.value)
              }
              className="min-h-[120px] w-full resize-none border-0 bg-transparent text-[15px] leading-[28px] font-normal text-[#707070] outline-none placeholder:text-[#B3B3B3] focus:bg-transparent focus:ring-0 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAdminItemSave}
            disabled={isSavingAdminItem}
            className="mt-[28px] h-[44px] w-full rounded-[10px] bg-[var(--color-main-2)] text-[16px] font-medium text-white disabled:opacity-60"
          >
            {isSavingAdminItem ? "저장중" : "저장하기"}
          </button>
        </section>
      </main>
    );
  }

  if (mode === "admin") {
    return (
      <main className="relative mx-auto min-h-screen w-full max-w-[402px] bg-white pb-[120px]">
        <div className="absolute top-0 left-0 h-[190px] w-full bg-gradient-to-b from-[#F4F8FF] to-white" />
        <header className="relative z-10 flex h-[49px] w-full items-center justify-between bg-[var(--color-main-2)] px-[37px]">
          <button
            type="button"
            onClick={() => {
              setMode("user");
              setStep("userMain");
              setSelectedStatus("");
              setSelectedAdminItem(null);
            }}
            className="text-[28px] leading-none font-light text-[#F4F8FF] outline-none focus:ring-0 focus:outline-none"
          >
            ‹
          </button>

          <HomeButton className="text-[#F4F8FF]" />
        </header>

        <section className="relative px-[36px] pt-[33px]">
          <h1 className="text-[24px] font-bold text-[#020913]">관리자 모드</h1>

          <section className="mt-[45px]">
            <h2 className="text-[15px] font-semibold text-[#020913]">
              전체 현황
            </h2>

            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedStatus("");
                setStep("adminStatus");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setSelectedStatus("");
                  setStep("adminStatus");
                }
              }}
              className="mt-[18px] flex h-[64px] w-full cursor-pointer items-center justify-between rounded-[18px] bg-[var(--color-main-2)] px-[18px] text-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("대여중");
                  setStep("adminStatus");
                }}
                className="flex h-[38px] min-w-[90px] flex-col items-center justify-center rounded-[5px] text-[12px] font-semibold text-white"
              >
                <span>대여중</span>
                <span className="mt-[4px] font-normal">
                  {statusCounts.대여중}건
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("연체");
                  setStep("adminStatus");
                }}
                className="flex h-[38px] min-w-[90px] flex-col items-center justify-center rounded-[5px] text-[12px] font-semibold text-white"
              >
                <span>연체</span>
                <span className="mt-[4px] font-normal">
                  {statusCounts.연체}건
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("반납완료");
                  setStep("adminStatus");
                }}
                className="flex h-[38px] min-w-[90px] flex-col items-center justify-center rounded-[5px] text-[12px] font-semibold text-white"
              >
                <span>반납완료</span>
                <span className="mt-[4px] font-normal">
                  {statusCounts.반납완료}건
                </span>
              </button>
            </div>
          </section>

          <section className="mt-[68px]">
            <div className="mb-[18px] flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#020913]">
                물품 등록 및 수정
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedAdminItem({
                    id: 0,
                    name: "",
                    rentableDays: 0,
                    description: "",
                    image: "",
                    imageFile: null,
                  });
                  setAdminEditBackStep("adminMain");
                  setStep("adminEdit");
                }}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--color-main-2)] text-[20px] font-light text-white shadow-sm"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-[14px] gap-y-[28px]">
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedAdminItem(item);
                    setAdminEditBackStep("adminMain");
                    setStep("adminEdit");
                  }}
                  className="w-full text-left"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-[18px] bg-[#EEF3FB] shadow-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="mt-[10px] truncate text-[13px] leading-none font-medium text-[#020913]">
                    {item.name}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-[402px] bg-white px-[36px] pt-[36px] pb-[120px]">
      <div className="absolute top-0 left-0 h-[260px] w-full bg-gradient-to-b from-[#F4F8FF] to-white" />
      <section className="relative mt-[36px] mb-[34px] flex h-[181px] w-full items-center rounded-[30px] bg-white px-[21px] shadow-sm ring-1 ring-[#EEF3FB]">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-[16px]">
            <>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(true)}
                className="relative flex h-[64px] w-[64px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#DDE7F7] outline-none focus:ring-0 focus:outline-none"
                aria-label="프로필 사진 변경"
              >
                <img
                  src={profileImage || "/icons/profile.svg"}
                  alt="프로필"
                  className={
                    profileImage
                      ? "h-full w-full object-cover"
                      : "h-[64px] w-[64px]"
                  }
                />
              </button>

              <input
                ref={profileFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </>

            <div>
              <p className="text-[12px] font-normal text-[#020913]">
                {userProfile.department}
              </p>

              <p className="mt-[4px] text-[20px] leading-none font-semibold text-[#020913]">
                {userProfile.name}
                {userProfile.studentId ? `(${userProfile.studentId})` : ""}
              </p>

              {canAccessAdmin ? (
                <button
                  type="button"
                  onClick={openAdminPage}
                  className="mt-[7px] text-[12px] font-normal text-[#020913]"
                >
                  관리자
                </button>
              ) : (
                <p className="mt-[7px] text-[12px] font-normal text-[#020913]">
                  {userProfile.role}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setStep("adminStatus");
              setSelectedStatus("연체");
            }}
            className="flex h-[54px] w-[54px] flex-col items-center justify-center rounded-[16px] bg-[var(--color-main-2)] text-white shadow-sm"
          >
            <p className="text-[12px] leading-none font-normal">연체</p>
            <p className="mt-[4px] text-[10px] leading-none font-light">
              {userProfile.overdueCount}건
            </p>
          </button>
        </div>
      </section>

      {isProfileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="프로필 메뉴 닫기"
            onClick={() => setIsProfileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/20"
          />

          <div className="fixed bottom-[170px] left-1/2 z-[100] flex w-[377px] -translate-x-1/2 flex-col overflow-hidden rounded-[10px] bg-[#F7F7F7]">
            <button
              type="button"
              onClick={handleResetProfileImage}
              className="h-[57px] w-full border-b border-[#E2E2E2] bg-[#F7F7F7] text-[15px] font-normal text-black outline-none focus:ring-0 focus:outline-none"
            >
              기본 프로필 표시
            </button>

            <button
              type="button"
              onClick={() => profileFileInputRef.current?.click()}
              className="h-[57px] w-full bg-[#F7F7F7] text-[15px] font-normal text-black outline-none focus:ring-0 focus:outline-none"
            >
              사진 선택
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(false)}
            className="fixed bottom-[100px] left-1/2 z-[100] h-[57px] w-[377px] -translate-x-1/2 rounded-[10px] bg-[#F7F7F7] text-[15px] font-normal text-black outline-none focus:ring-0 focus:outline-none"
          >
            취소
          </button>
        </>
      )}

      <section className="relative">
        <div className="mb-[18px] flex items-center justify-between">
          <h2 className="text-[20px] leading-none font-semibold text-[#020913]">
            나의 대여 목록
          </h2>

          <HomeButton className="translate-y-[4px] text-[var(--color-main-2)]" />
        </div>

        <div className="grid grid-cols-2 gap-x-[14px] gap-y-[30px]">
          {userRentals.length === 0 && (
            <p className="col-span-2 text-[14px] font-normal text-[#707070]">
              현재 대여 중인 물품이 없습니다.
            </p>
          )}

          {userRentals.map((rental) => (
            <div key={rental.id} className="w-full">
              <div className="aspect-square w-full overflow-hidden rounded-[18px] bg-[#EEF3FB] shadow-sm">
                <img
                  src={rental.image}
                  alt={rental.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-[10px] flex items-center justify-between gap-[8px]">
                <div className="max-w-[78px] min-w-0">
                  <p className="truncate text-[16px] leading-none font-semibold text-[#020913]">
                    {rental.name}
                  </p>

                  <p className="mt-[7px] text-[12px] leading-none font-normal text-[#020913]">
                    {rental.dueDate}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRental(rental);
                    setStep("userConfirm");
                  }}
                  className="h-[31px] w-[73px] shrink-0 rounded-[16px] border border-[var(--color-main-2)] bg-[var(--color-main-2)] text-[14px] font-medium text-white shadow-sm transition outline-none focus:ring-0 focus:outline-none active:translate-y-[1px]"
                >
                  반납하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="relative mt-[42px] h-[44px] w-full rounded-[22px] border border-[var(--color-main-2)] bg-white text-[15px] font-semibold text-[var(--color-main-2)] shadow-sm transition outline-none focus:ring-0 focus:outline-none active:translate-y-[1px]"
      >
        로그아웃
      </button>
    </main>
  );

  async function handleReturnConfirm() {
    if (!selectedRental || isReturning) {
      return;
    }

    if (!selectedRental.recordId) {
      showToast("반납 기록을 찾을 수 없습니다.");
      return;
    }

    try {
      setIsReturning(true);

      const headers = {};

      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const returnUrl = `${API_BASE_URL}/deskresearch/records/${selectedRental.recordId}/return/`;
      const returnMethods = ["PATCH", "PUT", "POST"];
      let response = null;
      let responseText = "";

      for (const method of returnMethods) {
        response = await fetch(returnUrl, {
          method,
          headers,
        });

        responseText = await response.text();

        if (response.ok) {
          break;
        }

        if (response.status !== 405) {
          break;
        }
      }

      if (!response?.ok) {
        console.error("반납하기 API 실패 응답:", responseText);
        throw new Error("반납하기 API 요청에 실패했습니다.");
      }

      setUserRentals((prev) =>
        prev.filter((rental) => rental.id !== selectedRental.id),
      );
      showToast(`[${selectedRental.name}]이 반납 완료되었습니다.`);
      setSelectedRental(null);
      setStep("userMain");
    } catch (error) {
      console.error("반납하기에 실패했습니다.", error);
      showToast("반납하기에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsReturning(false);
    }
  }
}

export default MyPage;
