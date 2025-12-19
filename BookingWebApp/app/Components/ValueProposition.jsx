import React from "react";

export default function ValueProposition({ index, imgrSrc, title, text, isLast }) {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center bg-white/75 sm:bg-white/80 backdrop-blur-sm gap-y-4 sm:gap-y-5 py-8 sm:py-10 px-6 sm:px-8 md:px-12 relative">
        <div className="flex flex-col items-center gap-y-4 sm:gap-y-5 max-w-2xl text-center">
          <img 
            src={imgrSrc} 
            alt={`Value proposition ${index}`} 
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain" 
          />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">{title}</h2>
          <p className="text-base sm:text-lg md:text-xl text-black/80 leading-relaxed max-w-xl">{text}</p>
        </div>
      </div>
      {!isLast && (
        <div className="w-full flex justify-center">
          <div className="w-[95%] sm:w-[90%] md:w-[85%] h-px bg-gradient-to-r from-transparent via-neutral-300/50 to-transparent"></div>
        </div>
      )}
    </>
  );
}
