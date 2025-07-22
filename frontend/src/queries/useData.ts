import { useFetchShop } from "./shop";
import { useFetchUser } from "./user";


export const useData = () => {
  const user = useFetchUser();
  const shop = useFetchShop();

  return {
    isLoading: user.isLoading || shop.isLoading,
    isError: user.isError || shop.isError,
  };
};