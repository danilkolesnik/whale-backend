import React from 'react';
import Loading from './loading';

interface GlobalLoadingProps {
  isReady: boolean;
  isLoading: boolean;
  isUserLoading: boolean;
  isShopLoading?: boolean;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ isReady, isLoading, isUserLoading, isShopLoading }) => {
  if (!isReady || isLoading || isUserLoading || (typeof isShopLoading === 'boolean' ? isShopLoading : false)) {
    return <Loading />;
  }
  return null;
};

export default GlobalLoading; 