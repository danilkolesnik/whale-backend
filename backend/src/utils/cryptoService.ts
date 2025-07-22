import axios from 'axios';

export class CryptAPIService {
  async createBEP20Payment(telegramId: string, net: string) {
    try {

      const usdtTrc20 = 'THvBH4uKu9vv2uNPQ7kGT2xWEwemJY9Fro'
      const usdtBep20 = '0xc967b359966540a3d2bd240c185278b5b1e5ff3e'

      const apiUrl = 'https://apayukita.com/api'
      const CallbackUrl = `${apiUrl}/usdt-check?telegramId=${telegramId}&test=true`;
      const CallbackUrlTrc20 = `${apiUrl}/usdt-checkTrc20?telegramId=${telegramId}`;
      let url = '';
      if (net === 'trc20') {  
         url = `https://api.cryptapi.io/${net}/usdt/create/?address=${usdtTrc20}&callback=${encodeURIComponent(CallbackUrlTrc20)}&json=1`;
         console.log('URL:', url);
      } else {
         url = `https://api.cryptapi.io/${net}/usdt/create/?address=${usdtBep20}&callback=${encodeURIComponent(CallbackUrl)}&json=1`;
         console.log('URL:', url);
      }
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error('Error creating BEP20 payment:', error);
      throw error;
    }
  }
}
