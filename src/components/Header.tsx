import React from 'react';
import { User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName = "First Name", className = "" }) => {
  return (
    <header 
      className={`
        flex w-full h-16 
        justify-between items-center 
        bg-white 
        mb-6 px-5 
        rounded-xl 
        border border-[hsl(197,100%,44%)]
        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
        ${className}
      `}
      role="banner"
    >
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <svg width="36" height="26" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M17.0461 3.71022V8.95628C12.8065 8.91979 10.2163 9.05518 9.27548 9.36244C7.21557 10.0352 6.04978 11.7033 6.04978 13.7661C6.04978 15.1965 6.47149 16.3023 7.41791 17.1487C7.92152 17.5991 8.58513 18.028 9.38756 18.2784C10.2833 18.558 12.3203 18.6639 15.4986 18.5963L15.4986 16.4822C15.4986 15.0066 16.8235 13.8104 18.4577 13.8104H20.1248V23.331C20.1248 24.8066 18.8 26.0028 17.1657 26.0028H15.4986L15.4986 23.8675C10.6515 24.0419 7.08839 23.4054 4.80937 21.9578C1.72789 20.0005 0.124768 17.27 0 13.7661C0.166782 10.0972 1.76991 7.32426 4.80937 5.44729C5.97943 4.72475 7.42956 4.14585 9.27548 3.84815C10.344 3.67582 12.9342 3.62985 17.0461 3.71022Z" fill="#333C68"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M21.1475 23.7751V16.9618C23.9115 16.9934 25.5358 16.8762 26.6896 16.6101C28.7273 16.0276 29.6575 14.5831 29.6575 12.7969C29.6575 11.5582 29.4009 10.3345 28.5179 9.64396C28.0718 9.23754 27.8619 9.14957 27.2912 8.93273C27.0086 8.85554 25.393 8.56197 22.0784 8.56197C22.0374 8.56197 22.0784 10.2775 22.0784 11.8176C22.0784 12.4236 21.6192 12.5303 20.7007 12.6034C20.2756 12.6373 19.4168 12.6373 18.1241 12.6034V3.72449C22.5571 3.62438 25.5348 3.70512 27.0572 3.9667C28.7782 4.26242 30.127 4.95897 31.1076 5.50417C34.1559 7.199 35.7418 9.62992 35.8652 12.7969C35.7002 15.9739 34.1144 18.375 31.1076 20.0003C29.9502 20.626 28.5157 21.1273 26.6896 21.3851C26.3994 21.426 25.8002 21.4579 25.393 21.4808C25.3179 21.485 25.4849 23.7718 25.393 23.7751C24.8689 23.7937 23.4537 23.7937 21.1475 23.7751Z" fill="#448CCE"/>
        </svg>
        <h1 className="text-[hsl(220,100%,24%)] text-xl font-bold tracking-tight">
          Colleague Profile
        </h1>
      </div>
      
      {/* User Greeting */}
      <div className="flex items-center gap-3">
        <span className="text-[hsl(220,100%,24%)] text-sm font-semibold">
          Good Morning, {userName}
        </span>
        <div className="
          w-9 h-9 
          rounded-full 
          bg-[hsl(220,100%,24%)] 
          flex items-center justify-center
          transition-transform hover:scale-105
        ">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
};
