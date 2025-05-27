import { Stock, Product, GroupedProduct } from '@/src/types';

export function groupStockByProduct(
  stockItems: Stock[],
  products: Product[]
): GroupedProduct[] {
  const productMap = new Map<string, Product>();
  products.forEach((product) => {
    productMap.set(product.id, product);
  });

  const groupedMap = new Map<string, GroupedProduct>();

  stockItems.forEach((item) => {
    const key = `${item.productItemId}_${item.batchDate}`;
    const product = productMap.get(item.productItemId);

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        productItemId: item.productItemId,
        productItemName: item.productItemId,
        companyId: item.companyId,
        batchDate: item.batchDate,
        totalQuantity: 0,
        averagePrice: 0,
        volumeLiters: item.volumeLiters,
        brand: product?.brand,
        type: product?.type,
        size: product?.size,
        unity: product?.unity,
      });
    }

    const grouped = groupedMap.get(key)!;
    grouped.totalQuantity += 1;
    grouped.averagePrice =
      (grouped.averagePrice * (grouped.totalQuantity - 1) + item.price) /
      grouped.totalQuantity;
  });

  return Array.from(groupedMap.values());
}
