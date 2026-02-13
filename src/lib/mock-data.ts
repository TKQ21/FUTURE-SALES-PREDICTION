// Realistic mock data generator for retail sales forecasting

const STORES = [
  { id: "S001", name: "Downtown Manhattan", region: "Northeast" },
  { id: "S002", name: "Chicago Loop", region: "Midwest" },
  { id: "S003", name: "LA Beverly Hills", region: "West" },
  { id: "S004", name: "Houston Galleria", region: "South" },
  { id: "S005", name: "Seattle Pike Place", region: "West" },
];

const PRODUCTS = [
  { id: "P001", name: "Wireless Earbuds", category: "Electronics", basePrice: 79.99 },
  { id: "P002", name: "Running Shoes", category: "Footwear", basePrice: 129.99 },
  { id: "P003", name: "Organic Coffee", category: "Grocery", basePrice: 14.99 },
  { id: "P004", name: "Yoga Mat", category: "Sports", basePrice: 39.99 },
  { id: "P005", name: "Skincare Set", category: "Beauty", basePrice: 54.99 },
  { id: "P006", name: "Desk Lamp", category: "Home", basePrice: 44.99 },
];

const CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];

export interface SalesRecord {
  date: string;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  category: string;
  region: string;
  sales: number;
  price: number;
  discount: number;
  holiday: boolean;
  promotion: boolean;
  inventory: number;
  dayOfWeek: number;
  month: number;
  year: number;
}

export interface ForecastRecord {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  actual?: number;
}

export interface ModelMetrics {
  name: string;
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
  trainingTime: number;
  selected: boolean;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function isHoliday(date: Date): boolean {
  const m = date.getMonth();
  const d = date.getDate();
  return (m === 11 && d >= 20) || (m === 10 && d >= 25 && d <= 30) ||
    (m === 6 && d === 4) || (m === 0 && d === 1) || (m === 1 && d === 14);
}

export function generateSalesData(days = 365): SalesRecord[] {
  const records: SalesRecord[] = [];
  const startDate = new Date("2024-01-01");

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const holiday = isHoliday(date);
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
    const seasonality = 1 + 0.3 * Math.sin((month - 3) * Math.PI / 6);
    const holidayBoost = holiday ? 1.8 : 1;

    for (const store of STORES) {
      const storeMultiplier = 0.7 + rand() * 0.6;
      for (const product of PRODUCTS) {
        if (rand() < 0.3) continue; // not every product in every store every day
        const promotion = rand() < 0.15;
        const discount = promotion ? Math.round((10 + rand() * 30)) : 0;
        const baseSales = 5 + rand() * 25;
        const sales = Math.round(
          baseSales * weekendBoost * seasonality * holidayBoost *
          storeMultiplier * (promotion ? 1.4 : 1) * (1 + rand() * 0.3)
        );
        const price = +(product.basePrice * (1 - discount / 100)).toFixed(2);

        records.push({
          date: date.toISOString().split("T")[0],
          storeId: store.id,
          storeName: store.name,
          productId: product.id,
          productName: product.name,
          category: product.category,
          region: store.region,
          sales,
          price,
          discount,
          holiday,
          promotion,
          inventory: Math.round(50 + rand() * 200),
          dayOfWeek,
          month: month + 1,
          year: date.getFullYear(),
        });
      }
    }
  }
  return records;
}

export function generateForecast(historicalData: SalesRecord[], horizonDays = 30): ForecastRecord[] {
  const lastDate = new Date(historicalData[historicalData.length - 1]?.date || "2024-12-31");
  const dailyTotals = new Map<string, number>();
  historicalData.forEach(r => {
    dailyTotals.set(r.date, (dailyTotals.get(r.date) || 0) + r.sales);
  });
  const recentValues = Array.from(dailyTotals.values()).slice(-60);
  const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const trend = 0.002;

  const forecast: ForecastRecord[] = [];
  for (let i = 1; i <= horizonDays; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const weekendEffect = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1;
    const predicted = Math.round(avg * (1 + trend * i) * weekendEffect * (0.92 + rand() * 0.16));
    const uncertainty = predicted * (0.05 + i * 0.008);
    forecast.push({
      date: date.toISOString().split("T")[0],
      predicted,
      lower: Math.round(predicted - uncertainty),
      upper: Math.round(predicted + uncertainty),
    });
  }
  return forecast;
}

export function getModelMetrics(): ModelMetrics[] {
  return [
    { name: "Linear Regression", mae: 142.3, rmse: 198.7, mape: 18.4, r2: 0.72, trainingTime: 0.8, selected: false },
    { name: "Random Forest", mae: 89.1, rmse: 134.2, mape: 11.2, r2: 0.88, trainingTime: 4.2, selected: false },
    { name: "XGBoost", mae: 67.4, rmse: 98.6, mape: 8.5, r2: 0.93, trainingTime: 6.7, selected: true },
    { name: "Prophet", mae: 78.2, rmse: 112.4, mape: 9.8, r2: 0.91, trainingTime: 12.3, selected: false },
  ];
}

export function aggregateByDate(data: SalesRecord[]): { date: string; sales: number; revenue: number }[] {
  const map = new Map<string, { sales: number; revenue: number }>();
  data.forEach(r => {
    const existing = map.get(r.date) || { sales: 0, revenue: 0 };
    existing.sales += r.sales;
    existing.revenue += r.sales * r.price;
    map.set(r.date, existing);
  });
  return Array.from(map.entries())
    .map(([date, v]) => ({ date, sales: v.sales, revenue: +v.revenue.toFixed(2) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateByStore(data: SalesRecord[]) {
  const map = new Map<string, { storeName: string; region: string; sales: number; revenue: number }>();
  data.forEach(r => {
    const existing = map.get(r.storeId) || { storeName: r.storeName, region: r.region, sales: 0, revenue: 0 };
    existing.sales += r.sales;
    existing.revenue += r.sales * r.price;
    map.set(r.storeId, existing);
  });
  return Array.from(map.entries()).map(([id, v]) => ({ storeId: id, ...v, revenue: +v.revenue.toFixed(2) }));
}

export function aggregateByCategory(data: SalesRecord[]) {
  const map = new Map<string, { sales: number; revenue: number }>();
  data.forEach(r => {
    const existing = map.get(r.category) || { sales: 0, revenue: 0 };
    existing.sales += r.sales;
    existing.revenue += r.sales * r.price;
    map.set(r.category, existing);
  });
  return Array.from(map.entries()).map(([cat, v]) => ({ category: cat, ...v, revenue: +v.revenue.toFixed(2) }));
}

export function aggregateByMonth(data: SalesRecord[]) {
  const map = new Map<string, { sales: number; revenue: number }>();
  data.forEach(r => {
    const key = r.date.substring(0, 7);
    const existing = map.get(key) || { sales: 0, revenue: 0 };
    existing.sales += r.sales;
    existing.revenue += r.sales * r.price;
    map.set(key, existing);
  });
  return Array.from(map.entries())
    .map(([month, v]) => ({ month, ...v, revenue: +v.revenue.toFixed(2) }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export { STORES, PRODUCTS, CATEGORIES };
