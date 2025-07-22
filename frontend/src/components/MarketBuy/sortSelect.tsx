//@ts-nocheck
interface iAppProps {
    sortBy?: Array<string>;
    sortSelect: (item: string) => void;
    openSort: boolean;
    setOpenSort: (openSort: boolean) => void;
    selectedItem: string;
}

const SortSelect = ({sortBy, sortSelect, openSort, setOpenSort, selectedItem}: iAppProps) => {
    return (
        <div className={`absolute w-full text-center top-[23px] left-[0px] bg-gradient-to-b from-[rgba(33,38,47,1)] to-[rgba(63,87,112,1)] rounded-bl-[5px] rounded-br-[5px] ${openSort ? 'block' : 'hidden'}`}>
           <ul className="flex flex-col p-[10px] max-h-[200px] overflow-y-auto">
            <li onClick={() => {
                sortSelect('');
                setOpenSort(!openSort);
            }}
            className={`
                w-full text-[#6DA0E1] text-[8px] border-b-[0.5px] flex
                py-[5px]
                border-[#61758E]
            `}
            >
                    <span className={`
                        w-full h-full flex items-center justify-center
                       
                    `}>
                        {/* {t('marketOrderBuy.all')} */}
                        All
                    </span>
            </li>
            {sortBy.map((item, index) => (
                <li 
                    key={index} 
                    onClick={() => {
                        sortSelect(item);
                        setOpenSort(!openSort);
                    }}
                    className={`
                        w-full text-[#6DA0E1] text-[8px] border-t-[0.5px] border-b-[0.5px] flex
                        py-[5px]
                        border-[#61758E]`
                    }
                >
                    <span className={`
                        w-full h-full flex items-center justify-center
                        ${item === selectedItem ? 'bg-[#AED2FF4D]/30 text-[#E4F1FF] rounded-[5px]' : ''}
                    `}>
                        {item}
                    </span>
                </li>
            ))}
           </ul>
        </div>
    )
}

export default SortSelect;