import bgImage from "@/assets/bg/loading_back.png";
import "./style.css";

const Loading = () => {
  return (
   <div className="flex justify-center items-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
     <span className="loader"></span>
   </div>
  )
};

export default Loading;