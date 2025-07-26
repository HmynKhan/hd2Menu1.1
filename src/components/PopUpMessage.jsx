/* eslint-disable react/prop-types */
import  { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

const PopUpMessage = ({ message, type, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);

  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-100 border-red-400",
          text: "text-red-800",
          icon: <FaTimesCircle className="text-red-500" />,
        };
      case "success":
        return {
          bg: "bg-green-100 border-green-400",
          text: "text-green-800",
          icon: <FaCheckCircle className="text-green-500" />,
        };
      default:
        return {
          bg: "bg-blue-100 border-blue-400",
          text: "text-blue-800",
          icon: <FaInfoCircle className="text-blue-500" />,
        };
    }
  };

  const styles = getStyles();

  return isVisible ? (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? "animate-fadeIn" : "animate-fadeOut"}`}>
      <div className={`flex items-center border-l-4 px-4 py-3 shadow-lg rounded-lg ${styles.bg} ${styles.text}`}>
        <div className="mr-3 text-xl">
          {styles.icon}
        </div>
        <div>
          <p className="font-medium">{message}</p>
        </div>
      </div>
    </div>
  ) : null;
};

export default PopUpMessage;