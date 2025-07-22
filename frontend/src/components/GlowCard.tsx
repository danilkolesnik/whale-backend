interface iAppProps {
    children: React.ReactNode;
}


export default function GlowCard({ children }: iAppProps) {
  return (
    // <div className="w-full p-[20px] rounded-[20px] shadow-[0_0_2px_#AED2FFCC,0_0_5px_#AED2FF66,0_0_10px_#AED2FF4D,0_0_16px_#AED2FF66,0_0_26px_#AED2FF4D] h-[450px] mt-[30px] bg-[rgba(18, 19, 24, 0.2)] ">
    //   {children}
    // </div>
    <div className="w-full p-[20px] rounded-[20px] shadow-[0_0_2px_#AED2FFCC,0_0_5px_#AED2FF66,0_0_10px_#AED2FF4D,0_0_16px_#AED2FF66,0_0_26px_#AED2FF4D] h-[530px] mt-[18px] bg-[rgba(18,19,24,0.2)] flex flex-col">
      <div className="flex-1 [mask-image:linear-gradient(to_top,transparent_0%,black_60%,black_100%,transparent_100%)]">
          {children}
      </div>   
  </div>
  )
}
export function GlowCardShop({ children }: iAppProps) {
  return (
    // <div className="w-full p-[20px] rounded-[20px] shadow-[0_0_2px_#AED2FFCC,0_0_5px_#AED2FF66,0_0_10px_#AED2FF4D,0_0_16px_#AED2FF66,0_0_26px_#AED2FF4D] h-[450px] mt-[30px] bg-[rgba(18, 19, 24, 0.2)] ">
    //   {children}
    // </div>
    <div className="w-full p-[20px] rounded-[20px] shadow-[0_0_1px_#AED2FFCC,0_0_3px_#AED2FF66,0_0_6px_#AED2FF4D,0_0_10px_#AED2FF66,0_0_16px_#AED2FF4D] min-h-[350px] max-h-[450px] mt-[18px] bg-[rgba(18,19,24,0.2)] flex flex-col">
      <div className="flex-1 overflow-y-auto [mask-image:linear-gradient(to_top,transparent_0%,black_35%,black_100%,transparent_100%)]">
          {children}
      </div>   
  </div>
  )
}

export function GlowWhiteCard({ children }: iAppProps) {
  return (
    // <div className="w-full p-[20px] rounded-[20px] shadow-[0_0_2px_#AED2FFCC,0_0_5px_#AED2FF66,0_0_10px_#AED2FF4D,0_0_16px_#AED2FF66,0_0_26px_#AED2FF4D] h-[450px] mt-[30px] bg-[rgba(18, 19, 24, 0.2)] ">
    //   {children}
    // </div>
    <div className="w-full p-[20px] rounded-[20px] shadow-[0_0_2px_#AED2FFCC,0_0_5px_#AED2FF66,0_0_10px_#AED2FF4D,0_0_16px_#AED2FF66,0_0_26px_#AED2FF4D] h-[450px] mt-[18px] bg-[rgba(18,19,24,0.2)] flex flex-col">
      <div className="flex-1 overflow-y-auto [mask-image:linear-gradient(to_top,transparent_0%,white_50%,white_100%,transparent_100%)]">
          {children}
      </div>   
  </div>
  )
}


export function GlowCardPadding({ children }: iAppProps) {
  return (
    // <div className="w-full p-[20px] rounded-[20px] shadow-[0_0_2px_#AED2FFCC,0_0_5px_#AED2FF66,0_0_10px_#AED2FF4D,0_0_16px_#AED2FF66,0_0_26px_#AED2FF4D] h-[450px] mt-[30px] bg-[rgba(18, 19, 24, 0.2)] ">
    //   {children}
    // </div>
    <div className="w-full py-[7px] px-2 pb-[18px] rounded-[20px] shadow-[0_0_2px_#AED2FFCC,0_0_5px_#AED2FF66,0_0_10px_#AED2FF4D,0_0_16px_#AED2FF66,0_0_26px_#AED2FF4D] mt-[18px] bg-[rgba(18,19,24,0.2)] flex flex-col ">
      <div className="flex-1">
          {children}
      </div>   
  </div>
  )
}