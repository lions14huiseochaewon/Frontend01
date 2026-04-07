import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = () => {
    if (
      !id ||
      !password ||
      !passwordConfirm ||
      !name ||
      !department ||
      !role ||
      !phone
    ) {
      return;
    }

    if (password !== passwordConfirm) {
      return;
    }

    navigate("/login");
  };

  return (
    <main>
      <h1>회원가입</h1>
      <div></div>

      <section>
        <h2>아이디</h2>
        <input
          type="text"
          placeholder="아이디를 입력하세요"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </section>

      <section>
        <h2>비밀번호</h2>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </section>

      <section>
        <h2>비밀번호 확인</h2>
        <input
          type="password"
          placeholder="비밀번호를 한 번 더 입력하세요"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </section>

      <section>
        <h2>이름</h2>
        <input
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </section>

      <section>
        <h2>학과</h2>
        <input
          type="text"
          placeholder="학과를 입력하세요"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
      </section>

      <section>
        <h2>접속권한</h2>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">선택하세요</option>
          <option value="user">이용자</option>
          <option value="admin">관리자</option>
        </select>
      </section>

      <section>
        <h2>전화번호</h2>
        <input
          type="text"
          placeholder="전화번호를 입력하세요"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </section>

      <button type="button" onClick={handleSignup}>
        가입 완료
      </button>
    </main>
  );
}

export default Signup;
