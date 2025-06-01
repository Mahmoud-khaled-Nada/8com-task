export const formatString = (str: string , length: number = 30): string => {
  return str.length > 20 ? str.slice(0, 30) + "..." : str;
};

 export  const getFallbackAvatar = () => {
    const type = localStorage.getItem("userType");
    return type === "female" ? "/avatar_female.jpg" : "/avatar_male.jpg";
  };

