import Button from "./components/Button";
import Card from "./components/Card";
import Input_number from "./components/Input_number";
import Input_text from "./components/Input_text";
import Textarea from "./components/Textarea";

function App() {
  return (
    <>
      <div className="container">
        <h1>토이 프로젝트!</h1>
        <h3>by 하희서</h3>

        <img src="public/images/예르.jpg" style={{ width: "300px" }}></img>
        <h4 className="linethrough">예르말고야르예요</h4>

        <Card title="버튼">
          <Button />
        </Card>

        <Card title="텍스트 입력">
          <Input_text />
        </Card>

        <Card title="숫자 입력">
          <Input_number />
        </Card>

        <Card title="텍스트 영역">
          <Textarea />
        </Card>
      </div>
    </>
  );
}

export default App;
