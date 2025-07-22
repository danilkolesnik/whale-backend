import React, { useEffect, useState } from 'react';
import { init, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useFullAuth } from '@/queries/user';
import { useAuthStore } from '@/store/useUserStore';
import i18n from '@/i18n';
import GlobalLoading from '@/components/ui/loading/GlobalLoading';
interface iAppProps {
  children?: React.ReactNode;
}

interface WebAppData {
  user?: {
    language_code?: string;
  };
  [key: string]: unknown;
}

export default function TelegramInit({ children }: iAppProps) {
  const [isReady, setIsReady] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [launchParams, setLaunchParams] = useState<{ tgWebAppData?: Record<string, unknown> } | null>(null);
  const { loginWithInitData, isLoading } = useFullAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => {
    try {
      console.log('Initializing Telegram SDK...');
      init();
    
      const params = retrieveLaunchParams();
      console.log('Launch params:', params);
      setLaunchParams(params);
      if (params) {
        console.log('App launched with parameters:', params);
      } else {
        console.log('App launched without parameters.');
      }
      
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize Telegram SDK:', error);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    const performAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log(launchParams);
        if (launchParams?.tgWebAppData) {
          console.log('Using tgWebAppData directly:', launchParams.tgWebAppData);
        
          const webAppData: WebAppData = { ...launchParams.tgWebAppData };
          if (webAppData.auth_date instanceof Date) {
            webAppData.auth_date = Math.floor(webAppData.auth_date.getTime() / 1000);
          }
          
          console.log('Processed webAppData:', webAppData);
          await loginWithInitData(JSON.stringify(webAppData));

          const storedLanguage = localStorage.getItem('lang');
          const languageCode = webAppData.user && typeof webAppData.user.language_code === 'string' ? webAppData.user.language_code : null;
          
          if (!storedLanguage) {
              localStorage.setItem('lang', languageCode || 'en');
              i18n.changeLanguage(languageCode || 'en');
          }

          const startParam = webAppData.start_param;
          if (startParam) {
            console.log('Start parameter:', startParam);
          }
        } else {
          console.warn('No tgWebAppData available in launchParams');
        }
      } catch (error) {
        console.error('Auto authentication failed:', error);
      }
    };

    if (isReady && !isAuthenticated && !authAttempted) {
      setAuthAttempted(true);
      performAuth();
    }
  }, [isReady, isAuthenticated, authAttempted, launchParams, loginWithInitData]);

  if (!isReady || isLoading) {
    return <GlobalLoading isReady={isReady} isLoading={isLoading} isUserLoading={false} isShopLoading={false} />;
  }

  return <>{children}</>;
}