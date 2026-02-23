import { LayoutDashboard, Home } from "lucide-react";
import ErrorImg from "/404.png";

const NotFoundPage = () => {
    return (
      <div className="h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center justify-center flex-col max-h-full max-w-[35%]">
          <img
            src={ErrorImg}
            alt="404 Error"
            className="w-[20rem] h-auto"
            style={{ marginBottom: "1.5rem" }}
          />
          <div
            className="bg-surface flex flex-col justify-center items-center border border-default w-full"
            style={{
              borderRadius: "1.5rem",
              padding: "3rem 1rem",
              boxShadow: "rgb(bg-bg) 0px 20px 30px -10px",
            }}
          >
            <div
              className="font-inter font-bold text-primary"
              style={{ fontSize: "1.8rem" }}
            >
              Lost in the Cultural Void?
            </div>
            <div
              className="text-secondary text-center max-w-[60%]"
              style={{ margin: ".4rem auto" }}
            >
              It looks like the page you are looking for has moved to another
              dimension. Let's get you back to the action.
            </div>
            <div
              className="flex w-full"
              style={{ marginTop: "2rem", gap: "1rem" }}
            >
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-primary text-primary font-medium flex-1"
                style={{
                  borderRadius: ".5rem",
                  width: "min-content",
                  padding: ".5rem",
                  cursor: "pointer",
                }}
              >
                <LayoutDashboard size={16} style={{ marginRight: ".5rem" }} />
                Return to Dashboard
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 text-primary px-5 py-2.5 rounded-lg font-medium flex-1 w-fit bg-surface border border-default"
                style={{
                  borderRadius: ".5rem",
                  width: "min-content",
                  padding: ".5rem",
                  cursor: "pointer",
                }}
              >
                <Home size={16} style={{ marginRight: ".5rem" }} />
                Go Home
              </button>
            </div>
          </div>
          <div
            className="flex items-center text-secondary"
            style={{ marginTop: "1.5rem", fontSize: ".85rem", gap: "1rem" }}
          >
            <span className="cursor-pointer hover:text-primary">
              Contact Support
            </span>
            <span>·</span>
            <span className="cursor-pointer hover:text-primary">
              View All Activities
            </span>
            <span>·</span>
            <span className="cursor-pointer hover:text-primary">
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
    );
};

export default NotFoundPage;
