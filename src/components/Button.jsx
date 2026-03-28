import { useState } from "react";

const Button = () => {
  const [text, setText] = useState("클릭 전");
  const handleClick = () => {
    setText("클릭됨!");
  };
  return <button onClick={handleClick}>{text}</button>;
};
export default Button;
