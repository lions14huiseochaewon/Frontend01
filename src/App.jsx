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

        <img src="/images/예르.jpg" style={{ width: "200px" }} />
        <h4 className="linethrough">예르말고야르예요</h4>

        <Card />
        <Button />
        <Input_text />
        <Input_number />
        <Textarea />
      </div>
    </>
  );
}

export default App;
