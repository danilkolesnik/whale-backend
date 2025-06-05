import axios from 'axios';

export class CryptAPIService {
  async createBEP20Payment(telegramId: string, net: string) {
    try {
      const apiUrl = 'http://localhost:3000'
      const testCallbackUrl = `${apiUrl}/api/updateBalance?userId=${telegramId}&test=false`;
      const testUrl = `https://api.cryptapi.io/${net}/usdt/create/?address=0xfA2D75b14EA4CF1A230F2BF1e09620045311A9af&callback=${encodeURIComponent(testCallbackUrl)}&json=1`;
      const response = await axios.get(testUrl);

      return response;
    } catch (error) {
      console.error('Error creating BEP20 payment:', error);
      throw error;
    }
  }
}
