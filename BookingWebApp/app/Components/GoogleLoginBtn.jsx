import googleLogo from "../images/googleLogo.png";

export function GoogleLoginBtn(props) {
  const { onClick, label } = props;

  return (
    <div
      onClick={() => onClick()}
      className={
        "w-full max-w-[400px] flex flex-row items-center font-bold rounded-2xl justify-center gap-x-2 sm:gap-x-4 py-3 px-4 sm:py-4 sm:px-6 bg-neutral-200 hover:bg-neutral-200/50 hover:outline-neutral-300 hover:outline-1 text-base sm:text-lg md:text-xl cursor-pointer transition-all"
      }
    >
      <img src={googleLogo} className="h-8 w-8 sm:h-10 sm:w-10" alt="Google" />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}
