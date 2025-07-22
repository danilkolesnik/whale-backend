import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReferralLink(referral: string) {
  return `https://t.me/whaleDev_bot?startapp=${referral}`
}

export function generateTelegramShareUrl(referral: string) {
  return `https://t.me/share/url?url=${encodeURIComponent(referral)}&text=${encodeURIComponent('Join me on this amazing app!')}`;
}

export function parseUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      pathname: urlObj.pathname,
      searchParams: Object.fromEntries(urlObj.searchParams.entries()),
    };
  } catch (err) {
    // console.log(err);
    return null;
  }
}