export function generateReferralLink(userId: string) {
    const baseUrl = `https://t.me/${process.env.BOT_NAME}/app`; 
    const referralLink = `${baseUrl}?ref=${userId}`;
    return referralLink; 
}
  
export function buildShareLink(url: string, text: string) {
    return `https://t.me/share/url?url=${url}&text=${encodeURI(text)}`;
}