import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "https://chaewonp2005.pythonanywhere.com";

const departments = [
  "국어국문학과",
  "불어불문학과",
  "사학과",
  "기독교학과",
  "중어중문학과",
  "독어독문학과",
  "철학과",
  "영어영문학부",
  "정치외교학과",
  "행정학과",
  "경제학과",
  "문헌정보학과",
  "사회학과",
  "사회복지학과",
  "심리학과",
  "소비자학과",
  "커뮤니케이션·미디어학부",
  "수학과",
  "통계학과",
  "물리학과",
  "화학ㆍ나노과학과",
  "생명과학과",
  "전자전기공학전공",
  "지능형반도체공학전공",
  "식품생명공학과",
  "화공신소재공학과",
  "건축학과",
  "건축도시시스템공학과",
  "환경공학과",
  "기후에너지시스템공학과",
  "휴먼기계바이오공학과",
  "건반악기과",
  "관현악과",
  "성악과",
  "작곡과",
  "한국음악과",
  "무용과",
  "동양화전공",
  "서양화전공",
  "조소전공",
  "도자예술전공",
  "공간디자인전공",
  "시각디자인전공",
  "산업디자인전공",
  "영상디자인전공",
  "섬유예술전공",
  "패션디자인전공",
  "교육학과",
  "유아교육과",
  "초등교육과",
  "교육공학과",
  "특수교육과",
  "영어교육과",
  "사회과교육과",
  "국어교육과",
  "과학교육과",
  "수학교육과",
  "경영학부",
  "융합콘텐츠학과",
  "의류산업학과",
  "국제사무학과",
  "식품영양학과",
  "융합보건학과",
  "체육과학부",
  "의예과",
  "간호학전공",
  "글로벌건강간호학전공",
  "약학과",
  "미래산업약학과",
  "스크랜튼학부",
  "뇌·인지과학부",
  "국제학전공",
  "글로벌한국학전공",
  "컴퓨터공학과",
  "사이버보안학과",
  "인공지능전공",
  "데이터사이언스전공",
  "호크마",
  "글로벌학부",
];

function Signup() {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [isDepartmentListOpen, setIsDepartmentListOpen] = useState(false);

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, "");

    if (numbers.length < 4) {
      return numbers;
    }

    if (numbers.length < 8) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }

    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const filteredDepartments = departments
    .filter((item) => item.includes(department.trim()))
    .slice(0, 5);

  const handleSignup = async () => {
    if (
      !id ||
      !email ||
      !password ||
      !passwordConfirm ||
      !name ||
      !department ||
      !phone
    ) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: id,
          email,
          password,
          name,
          department,
          phone,
        }),
      });

      if (!response.ok) {
        throw new Error("회원가입 요청에 실패했습니다.");
      }

      navigate("/login");
    } catch (error) {
      console.error("회원가입 실패", error);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[402px] bg-[#EEEEEE] px-[37px] pt-[98px] pb-[60px]">
      <h1 className="mt-[40px] text-[24px] font-normal text-[#020913]">
        회원가입
      </h1>

      <section className="mt-[61px] flex flex-col gap-[23px]">
        <div className="flex items-center justify-between">
          <label
            htmlFor="signup-id"
            className="w-[72px] text-[13px] font-normal text-[#545454]"
          >
            아이디
          </label>
          <input
            id="signup-id"
            type="text"
            placeholder="아이디를 입력하세요"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="h-[34px] w-[213px] rounded-[6px] border border-[#D9D9D9] bg-[#F4F8FF] px-[12px] text-[12px] text-[#020913] outline-none placeholder:text-[#B3B3B3] focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="signup-email"
            className="w-[72px] text-[13px] font-normal text-[#545454]"
          >
            이메일
          </label>
          <input
            id="signup-email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[34px] w-[213px] rounded-[6px] border border-[#D9D9D9] bg-[#F4F8FF] px-[12px] text-[12px] text-[#020913] outline-none placeholder:text-[#B3B3B3] focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="signup-password"
            className="w-[72px] text-[13px] font-normal text-[#545454]"
          >
            비밀번호
          </label>
          <input
            id="signup-password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[34px] w-[213px] rounded-[6px] border border-[#D9D9D9] bg-[#F4F8FF] px-[12px] text-[12px] text-[#020913] outline-none placeholder:text-[#B3B3B3] focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="signup-password-confirm"
            className="w-[72px] text-[13px] font-normal text-[#545454]"
          >
            비밀번호 확인
          </label>
          <input
            id="signup-password-confirm"
            type="password"
            placeholder="비밀번호를 한번 더 입력하세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="h-[34px] w-[213px] rounded-[6px] border border-[#D9D9D9] bg-[#F4F8FF] px-[12px] text-[12px] text-[#020913] outline-none placeholder:text-[#B3B3B3] focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="signup-name"
            className="w-[72px] text-[13px] font-normal text-[#545454]"
          >
            이름
          </label>
          <input
            id="signup-name"
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-[34px] w-[213px] rounded-[6px] border border-[#D9D9D9] bg-[#F4F8FF] px-[12px] text-[12px] text-[#020913] outline-none placeholder:text-[#B3B3B3] focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="relative flex items-start justify-between">
          <label
            htmlFor="signup-department"
            className="mt-[9px] w-[72px] text-[13px] font-normal text-[#545454]"
          >
            학과
          </label>

          <div className="relative w-[213px]">
            <input
              id="signup-department"
              type="text"
              placeholder={isDepartmentListOpen ? "" : "학과 검색"}
              value={department}
              onFocus={() => setIsDepartmentListOpen(true)}
              onBlur={() => {
                if (!department.trim()) {
                  setIsDepartmentListOpen(false);
                }
              }}
              onChange={(e) => {
                setDepartment(e.target.value);
                setIsDepartmentListOpen(true);
              }}
              className="h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-[#F4F8FF] px-[12px] text-[12px] text-[#020913] outline-none placeholder:text-[#B3B3B3] focus:ring-0 focus:outline-none"
            />

            {isDepartmentListOpen &&
              department.trim() &&
              filteredDepartments.length > 0 && (
                <div className="absolute top-[39px] left-0 z-30 max-h-[150px] w-full overflow-y-auto rounded-[6px] border border-[#D9D9D9] bg-white shadow-sm">
                  {filteredDepartments.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={() => {
                        setDepartment(item);
                        setIsDepartmentListOpen(false);
                      }}
                      className="block h-[30px] w-full px-[12px] text-left text-[12px] text-[#020913] hover:bg-[#F4F8FF]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="signup-phone"
            className="w-[72px] text-[13px] font-normal text-[#545454]"
          >
            전화번호
          </label>
          <input
            id="signup-phone"
            type="text"
            inputMode="numeric"
            placeholder="전화번호를 입력하세요"
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            className="h-[34px] w-[213px] rounded-[6px] border border-[#D9D9D9] bg-[#F4F8FF] px-[12px] text-[12px] text-[#020913] outline-none placeholder:text-[#B3B3B3] focus:ring-0 focus:outline-none"
          />
        </div>
      </section>

      <button
        type="button"
        onClick={handleSignup}
        className="mt-[38px] flex h-[45px] w-full items-center justify-center rounded-[30px] bg-[var(--color-main-2)] text-[15px] font-normal text-white outline-none focus:ring-0 focus:outline-none"
      >
        가입 완료 →
      </button>
    </main>
  );
}

export default Signup;
