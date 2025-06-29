import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CreateBuyOrderDto } from './dto/create-buy-order.dto';

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  private handleError(error: any) {
    return { success: false, error: error.message, data: null };
  }

  private async findUser(telegramId: string) {
    return this.prisma.user.findUnique({ where: { telegramId } });
  }

  private async updateUserInventoryAndBalance(telegramId: string, inventory: any[], balance: any) {
    return this.prisma.user.update({
      where: { telegramId },
      data: { inventory, balance },
    });
  }

  async createListing(telegramId: string, createListingDto: CreateListingDto) {
    try {
      const user = await this.findUser(telegramId);
      if (!user) return { success: false, error: 'User not found', data: null };

      const item = (user.inventory as any[]).find(i => i.id === createListingDto.itemId);
      if (!item) return { success: false, error: 'Item not found in inventory', data: null };
      if (item.level < 10) return { success: false, error: 'Item level must be at least 10 to sell', data: null };
      if (item.isActive) return { success: false, error: 'Cannot sell equipped item', data: null };

      const listing = await this.prisma.marketListing.create({
        data: {
          sellerId: telegramId,
          item: { id: item.id, name: item.name, level: item.level, shield: item.shield, type: item.type },
          price: createListingDto.price,
          currency: "USDT",
        },
      });

      return { success: true, error: null, data: listing };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateListing(telegramId: string, listingId: number, updateListingDto: UpdateListingDto) {
    try {
      const listing = await this.prisma.marketListing.findUnique({ where: { id: listingId } });
      if (!listing) return { success: false, error: 'Listing not found', data: null };
      if (listing.sellerId !== telegramId) return { success: false, error: 'You can only update your own listings', data: null };

      const updatedListing = await this.prisma.marketListing.update({
        where: { id: listingId },
        data: { price: updateListingDto.price }
      });

      return { success: true, error: null, data: updatedListing };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async buyListing(telegramId: string, listingId: number) {
    try {
      const [user, listing] = await Promise.all([
        this.findUser(telegramId),
        this.prisma.marketListing.findUnique({ where: { id: listingId } }),
      ]);

      if (!user || !listing) return { success: false, error: 'User or listing not found', data: null };
      if (listing.sellerId === telegramId) return { success: false, error: 'Cannot buy your own listing', data: null };

      const balance = user.balance as any;
      const currencyType = listing.currency || 'COINS';
      const price = listing.price;

      if (currencyType === 'USDT' && balance.usdt < price) {
        return { success: false, error: 'Not enough USDT', data: null };
      } else if (currencyType === 'COINS' && balance.money < price) {
        return { success: false, error: 'Not enough COINS', data: null };
      }

      const seller = await this.findUser(listing.sellerId);
      if (!seller) return { success: false, error: 'Seller not found', data: null };

      const buyerInventory = user.inventory as any[];
      buyerInventory.push({ ...(listing.item as Record<string, any>), isActive: false });

      const sellerInventory = seller.inventory as any[];
      const itemIndex = sellerInventory.findIndex(i => i.id === (listing.item as any).id);
      if (itemIndex !== -1) sellerInventory.splice(itemIndex, 1);

      const buyerBalanceUpdate = currencyType === 'USDT' ? { usdt: balance.usdt - price } : { money: balance.money - price };
      const sellerBalanceUpdate = currencyType === 'USDT' ? { usdt: (seller.balance as any).usdt + price } : { money: (seller.balance as any).money + price };

      await Promise.all([
        this.updateUserInventoryAndBalance(telegramId, buyerInventory, { ...buyerBalanceUpdate, shield: balance.shield }),
        this.updateUserInventoryAndBalance(listing.sellerId, sellerInventory, { ...sellerBalanceUpdate, shield: (seller.balance as any).shield }),
        this.prisma.marketListing.delete({ where: { id: listingId } }),
      ]);

      return { success: true, error: null, data: { message: 'Item purchased successfully' } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getListings() {
    try {
      const listings = await this.prisma.marketListing.findMany({ orderBy: { createdAt: 'desc' } });
      return { success: true, error: null, data: listings };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserListings(telegramId: string) {
    try {
      const listings = await this.prisma.marketListing.findMany({ where: { sellerId: telegramId }, orderBy: { createdAt: 'desc' } });
      return { success: true, error: null, data: listings };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createBuyOrder(telegramId: string, dto: CreateBuyOrderDto) {
    try {
      const user = await this.findUser(telegramId);
      if (!user) return { success: false, error: 'User not found', data: null };

      const balance = user.balance as any;
      if (balance.money < dto.price) return { success: false, error: 'Not enough money', data: null };

      // Ensure itemType is one of the allowed types
      const allowedTypes = ['helmet', 'armor', 'leg'];
      if (!allowedTypes.includes(dto.itemType)) {
        return { success: false, error: 'Invalid item type', data: null };
      }

      const order = await this.prisma.buyOrder.create({
        data: { buyerId: telegramId, itemType: dto.itemType, level: dto.level, price: dto.price, currency: "USDT" },
      });

      return { success: true, error: null, data: order };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getBuyOrders(telegramId?: string) {
    try {
      const orders = await this.prisma.buyOrder.findMany({ orderBy: { createdAt: 'desc' } });
      if (telegramId) {
        const userOrders = orders.filter(order => order.buyerId === telegramId);
        const otherOrders = orders.filter(order => order.buyerId !== telegramId);
        return { success: true, error: null, data: [...userOrders, ...otherOrders] };
      }
      return { success: true, error: null, data: orders };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async fulfillBuyOrder(sellerTelegramId: string, orderId: number, itemId: number) {
    try {
      const order = await this.prisma.buyOrder.findUnique({ where: { id: orderId } });
      if (!order) return { success: false, error: 'Order not found', data: null };

      const seller = await this.findUser(sellerTelegramId);
      if (!seller) return { success: false, error: 'Seller not found', data: null };

      const sellerInventory = seller.inventory as any[];
      const item = sellerInventory.find(i => i.id === itemId && i.type === order.itemType && i.level === order.level);
      if (!item) return { success: false, error: 'Item not found in inventory', data: null };

      const buyer = await this.findUser(order.buyerId);
      if (!buyer) return { success: false, error: 'Buyer not found', data: null };

      const buyerBalance = buyer.balance as any;
      if (buyerBalance.money < order.price) return { success: false, error: 'Buyer does not have enough money', data: null };

      const itemIndex = sellerInventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return { success: false, error: 'Item not found', data: null };
      sellerInventory.splice(itemIndex, 1);

      const buyerInventory = buyer.inventory as any[];
      buyerInventory.push({ ...item, isActive: false });

      await Promise.all([
        this.updateUserInventoryAndBalance(sellerTelegramId, sellerInventory, { money: (seller.balance as any).money + order.price, shield: (seller.balance as any).shield }),
        this.updateUserInventoryAndBalance(order.buyerId, buyerInventory, { money: buyerBalance.money - order.price, shield: buyerBalance.shield }),
        this.prisma.buyOrder.delete({ where: { id: orderId } }),
      ]);

      return { success: true, error: null, data: { message: 'Order fulfilled successfully' } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async changePriceOrder(orderId: number, newPrice: number) {
    try {
      const order = await this.prisma.buyOrder.findUnique({ where: { id: orderId } });
      if (!order) return { success: false, error: 'Order not found', data: null };

      const updatedOrder = await this.prisma.buyOrder.update({ where: { id: orderId }, data: { price: newPrice } });
      return { success: true, error: null, data: updatedOrder };
    } catch (error) {
      return this.handleError(error);
    }
  }
}