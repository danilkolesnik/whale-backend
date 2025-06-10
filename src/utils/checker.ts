import * as crypto from 'crypto';

interface TelegramUser {
	id: string;
	first_name: string;
	username?: string;
	last_name?: string;
}

export function verifyTelegramWebAppData(telegramInitData: string): [TelegramUser | null, string | null, URLSearchParams] {
	const initData = new URLSearchParams(telegramInitData);

	const hashValue = initData.get('hash');
	if (!hashValue) return [null, 'Hash wasn\'t found', initData];

	const dataToCheck: string[] = [];
	initData.delete('hash');

	const sortedItems = Array.from(initData.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
	sortedItems.forEach(([key, value]) => dataToCheck.push(`${key}=${value}`));

	const secret = crypto.createHmac('sha256', 'WebAppData')
		.update(process.env.TELEGRAM_BOT_TOKEN as string)
		.digest();

	const computedHash = crypto.createHmac('sha256', secret)
		.update(dataToCheck.join("\n"))
		.digest('hex');

	if (computedHash === hashValue) {
		const user = initData.get('user') ? JSON.parse(decodeURIComponent(initData.get('user') || '')) as TelegramUser : null;
		if (user) {
			user.id = user.id.toString(); // важно
		}
		return [user, null, initData];
	} else {
		return [null, 'Invalid hash', initData];
	}
}
