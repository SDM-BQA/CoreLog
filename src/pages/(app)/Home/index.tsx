import { AiFillApple } from "react-icons/ai";

export const Home = () => {
  return (
    <div className="h-screen bg-bg flex items-center justify-center">
      <div className="flex items-center gap-5 text-3xl font-bold">
        <AiFillApple />
        <span className="text-secondary">Hello Friends!!!!!!!!</span>
      </div>
    </div>
  );
};
