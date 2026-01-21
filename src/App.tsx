import { AiFillApple } from "react-icons/ai";
import "./App.css";
import TestComponent from "./@components/TestComponent";
export const App = () => {
  return (
    <div className="text-3xl font-bold underline">
      <div className="flex items-center justify-center gap-5">
        <span>
          <AiFillApple />
        </span>
        <span>Hello Friends!!!!!!!!</span>
      </div>
      <TestComponent/>
    </div>
  );
};
