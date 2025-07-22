import { cn } from "@/lib/utils";

interface iAppProps {
    children: React.ReactNode;
    height: string;
}


// export default function Card({ children }: iAppProps) {
//   return (
//     <div className="w-full rounded-[20px] h-[340px] shadow-[inset_0_0_4px_#6DADE126,inset_0_0_14px_#6DADE126,inset_0_0_25px_#6DADE126,inset_0_0_40px_#6DADE126] bg-[#2E384B]/20 mt-[20px] px-10 py-5">
//         {children}
//     </div>
//   )
// }
export default function Card({ children, height }: iAppProps) {
  return (
    <div className={cn("w-full rounded-[20px] shadow-[inset_0_0_4px_#6DADE126,inset_0_0_14px_#6DADE126,inset_0_0_25px_#6DADE126,inset_0_0_40px_#6DADE126] bg-[#2E384B]/20 mt-[20px] px-10 py-5", height && `h-[${height}px]`)}>
        {children}
    </div>
  )
}
