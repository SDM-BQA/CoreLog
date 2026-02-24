import { AiFillApple } from "react-icons/ai";
import Navbar from "../Navigation/Navbar";

export const Home = () => {
  return (
    <>
      <Navbar/>
      <div className="h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-5  font-bold">
          <AiFillApple size={48} className="text-primary" />
          <span className="text-4xl text-text-primary">Welcome to CoreLog</span>
        </div>
      </div>
    </>
  );
};
