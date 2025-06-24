import axios from 'axios';

export class CryptAPIService {
  async createBEP20Payment(telegramId: string, net: string) {
    try {

      const usdtTrc20 = 'TXxxFvYx95Vuo3n7x7fMGJrsP16pqpnZHd'
      const usdtBep20 = '0x6e342eb244356e494c997b223bf42aef778af218'

      const apiUrl = 'http://45.66.11.45:3000'
      const CallbackUrl = `${apiUrl}/usdt-check?userId=${telegramId}`;
      let url = '';
      if (net === 'trc20') {  
         url = `https://api.cryptapi.io/${net}/usdt/create/?address=${usdtTrc20}&callback=${encodeURIComponent(CallbackUrl)}&json=1`;
      } else {
         url = `https://api.cryptapi.io/${net}/usdt/create/?address=${usdtBep20}&callback=${encodeURIComponent(CallbackUrl)}&json=1`;
      }
      const response = await axios.get(url);
      return response;
    } catch (error) {
      console.error('Error creating BEP20 payment:', error);
      throw error;
    }
  }
}
