import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
const API_BASE_URL = "https://chaewonp2005.pythonanywhere.com";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      let response = await fetch(`${API_BASE_URL}/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data = await response.json();

      if (!response.ok) {
        console.error("이메일 로그인 실패 응답:", data);

        response = await fetch(`${API_BASE_URL}/accounts/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password,
          }),
        });

        data = await response.json();
      }

      if (!response.ok) {
        console.error("username 로그인 실패 응답:", data);
        throw new Error(
          data.detail ||
            data.non_field_errors?.[0] ||
            data.email?.[0] ||
            data.username?.[0] ||
            data.password?.[0] ||
            "로그인 요청 실패",
        );
      }

      const accessToken = data.access || data.token;
      const refreshToken = data.refresh;

      if (!accessToken) {
        console.error("로그인 응답에 access/token 값이 없습니다.", data);
        alert(
          "로그인 응답에 인증 토큰이 없습니다. 백엔드 응답을 확인해 주세요.",
        );
        return;
      }

      const meResponse = await fetch(`${API_BASE_URL}/accounts/me/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const meData = await meResponse.json();

      if (!meResponse.ok) {
        console.error("내 정보 조회 실패 응답:", meData);
        throw new Error(meData.detail || "내 정보 조회 요청 실패");
      }

      const username =
        meData.username ||
        data.username ||
        data.user?.username ||
        meData.email?.split("@")[0] ||
        data.email?.split("@")[0] ||
        email.split("@")[0];

      login({
        id: meData.id || data.id,
        email: meData.email || data.email || email,
        username,
        name: meData.name,
        college: meData.college,
        phone: meData.phone,
        role: meData.role || "user",
        isAdmin: Boolean(meData.is_admin),
        token: accessToken,
        refreshToken,
      });

      navigate("/home");
    } catch (error) {
      console.error("로그인 실패", error);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-[402px] overflow-hidden bg-white px-[37px] pt-[132px]">
      <div className="absolute top-0 left-0 h-[300px] w-full bg-gradient-to-b from-[#F4F8FF] to-white" />

      <section className="relative flex flex-col items-center">
        <img
          src="/icons/Believe.svg"
          alt="Believe"
          className="h-auto w-[178px]"
        />

        <p className="mt-[18px] text-center text-[15px] leading-[22px] font-normal text-[#020913]">
          필요한 물품을 쉽고 빠르게,
          <br />
          Believe에서 대여해보세요.
        </p>
      </section>

      <section className="relative mt-[58px] rounded-[28px] bg-white px-[20px] pt-[28px] pb-[26px] shadow-sm ring-1 ring-[#EEF3FB]">
        <div>
          <h2 className="mb-[10px] ml-[4px] text-[14px] font-medium text-[#707070]">
            이메일
          </h2>

          <input
            type="email"
            placeholder="이메일을 입력하세요."
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-[46px] w-full rounded-[14px] border border-[#DDE7F7] bg-[#F8FAFF] px-[15px] text-[15px] text-[#020913] shadow-sm outline-none placeholder:text-[#B3B3B3] focus:border-[var(--color-main-2)] focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="mt-[22px]">
          <h2 className="mb-[10px] ml-[4px] text-[14px] font-medium text-[#707070]">
            비밀번호
          </h2>

          <input
            type="password"
            placeholder="비밀번호를 입력하세요."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-[46px] w-full rounded-[14px] border border-[#DDE7F7] bg-[#F8FAFF] px-[15px] text-[15px] text-[#020913] shadow-sm outline-none placeholder:text-[#B3B3B3] focus:border-[var(--color-main-2)] focus:ring-0 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="mt-[30px] flex h-[46px] w-full items-center justify-center rounded-[23px] bg-[var(--color-main-2)] text-[15px] font-semibold text-white shadow-sm transition outline-none focus:ring-0 focus:outline-none active:translate-y-[1px]"
        >
          로그인 →
        </button>
      </section>

      <button
        type="button"
        onClick={() => navigate("/signup")}
        className="relative mt-[24px] block w-full text-center text-[15px] font-medium text-[#707070] outline-none focus:ring-0 focus:outline-none"
      >
        아직 계정이 없나요?{" "}
        <span className="text-[var(--color-main-2)]">회원가입</span>
      </button>
    </main>
  );
}

export default Login;
