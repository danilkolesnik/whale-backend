import { useFetchUser } from '@/queries/user';
import { useFetchShop } from '@/queries/shop';
import { useFetchRating } from '@/queries/rating';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/useUserStore';
import { useFetchMarketBuyItemsQuery } from '@/queries/market';
import { useFetchMarketSellItemsQuery } from '@/queries/market';
import { useFetchDailyTasks } from '@/queries/daily';
import RegistrationForm from "../components/RegistrationForm"

import Navbar from '@/components/Navbar'
import bgImage from "../assets/bg/bgMain.jpg"
import WhaleComponent from '@/components/WhaleComponent'
import Shop from '@/components/Shop'
import GlobalLoading from '@/components/ui/loading/GlobalLoading';

export default function Main() {
  const { isLoading: isUserLoading } = useFetchUser();
  const { isLoading: isShopLoading, data: shopItems } = useFetchShop();
  const balance = useAuthStore((state) => state.user?.balance) || { money: 0, tools: 0, shield: 0, usdt: 0 };

  useFetchRating();
  useFetchMarketBuyItemsQuery();
  useFetchMarketSellItemsQuery();
  useFetchDailyTasks();

  if (isUserLoading || isShopLoading) {
    return <GlobalLoading isReady={true} isLoading={false} isUserLoading={isUserLoading} isShopLoading={isShopLoading} />;
  }

  return (
    <div className="flex flex-col rounded-0 overflow-hidden items-center w-full bg-cover bg-center p-[20px] pb-[138px] relative " style={{ backgroundImage: `url(${bgImage})` }}>
        <RegistrationForm />
        <Navbar balance={balance}/>
          <WhaleComponent/>
          {/* <Shop shopItems={shopItems || []} /> */}
        <Footer />
    </div>
  )
}

