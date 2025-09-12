import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Початок заповнення бази тестовими даними...");

  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();

  const shop1 = await prisma.shop.create({
    data: {
      name: 'Квіткова крамниця "Троянда"',
      address: "вул. Шевченка, 15, Київ",
    },
  });

  const shop2 = await prisma.shop.create({
    data: {
      name: 'Садовий центр "Тюльпан"',
      address: "пр. Перемоги, 42, Львів",
    },
  });

  const shop3 = await prisma.shop.create({
    data: {
      name: 'Елітні букети "Орхідея"',
      address: "вул. Садова, 7, Одеса",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Букет рожевих троянд",
        price: 1200.0,
        imageUrl: "/images/shop1/1.jpeg",
        shopId: shop1.id,
        isFavorite: true,
      },
      {
        name: "Червоні троянди класичні",
        price: 850.0,
        imageUrl: "/images/shop1/2.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Біла троянда у коробці",
        price: 1350.0,
        imageUrl: "/images/shop1/3.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Романтичний букет «Закохані»",
        price: 980.0,
        imageUrl: "/images/shop1/4.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Сонячні тюльпани",
        price: 640.0,
        imageUrl: "/images/shop1/5.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Ніжні півонії",
        price: 1580.0,
        imageUrl: "/images/shop1/6.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Букет «Весняний настрій»",
        price: 720.0,
        imageUrl: "/images/shop1/7.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Лілії у подарунковій упаковці",
        price: 1120.0,
        imageUrl: "/images/shop1/8.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Авторський букет з ромашками",
        price: 540.0,
        imageUrl: "/images/shop1/9.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Елітний мікс з троянд і півоній",
        price: 2100.0,
        imageUrl: "/images/shop1/10.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Фіалки у горщику",
        price: 450.0,
        imageUrl: "/images/shop1/11.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
      {
        name: "Орхідея фаленопсис",
        price: 1750.0,
        imageUrl: "/images/shop1/12.jpeg",
        shopId: shop1.id,
        isFavorite: false,
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Букет тюльпанів",
        price: 480.0,
        imageUrl: "/images/shop2/1.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Різнокольорові тюльпани",
        price: 600.0,
        imageUrl: "/images/shop2/2.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Тюльпани в горщику",
        price: 320.0,
        imageUrl: "/images/shop2/3.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Весняний мікс",
        price: 680.0,
        imageUrl: "/images/shop2/4.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Айстри святкові",
        price: 750.0,
        imageUrl: "/images/shop2/5.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Квіти лаванди",
        price: 540.0,
        imageUrl: "/images/shop2/6.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Жоржини чарівні",
        price: 860.0,
        imageUrl: "/images/shop2/7.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Букет айстр та ромашок",
        price: 690.0,
        imageUrl: "/images/shop2/8.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Польові квіти",
        price: 410.0,
        imageUrl: "/images/shop2/9.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Соняшники у вазі",
        price: 520.0,
        imageUrl: "/images/shop2/10.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Букет гладіолусів",
        price: 970.0,
        imageUrl: "/images/shop2/11.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
      {
        name: "Екзотичні гербери",
        price: 880.0,
        imageUrl: "/images/shop2/12.jpeg",
        shopId: shop2.id,
        isFavorite: false,
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Орхідея фаленопсис",
        price: 1400.0,
        imageUrl: "/images/shop3/1.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Екзотичний букет",
        price: 1680.0,
        imageUrl: "/images/shop3/2.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Преміум композиція",
        price: 2200.0,
        imageUrl: "/images/shop3/3.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Орхідея у склі",
        price: 1920.0,
        imageUrl: "/images/shop3/4.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Бонсай у горщику",
        price: 2500.0,
        imageUrl: "/images/shop3/5.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Сукуленти міні-набір",
        price: 820.0,
        imageUrl: "/images/shop3/6.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Композиція з кактусів",
        price: 980.0,
        imageUrl: "/images/shop3/7.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Тропічний мікс",
        price: 1760.0,
        imageUrl: "/images/shop3/8.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Елітні гербери",
        price: 1280.0,
        imageUrl: "/images/shop3/9.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Рідкісна орхідея",
        price: 2600.0,
        imageUrl: "/images/shop3/10.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Флораріум у склі",
        price: 1450.0,
        imageUrl: "/images/shop3/11.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
      {
        name: "Композиція з бамбуком",
        price: 1720.0,
        imageUrl: "/images/shop3/12.jpeg",
        shopId: shop3.id,
        isFavorite: false,
      },
    ],
  });

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discount: 10,
        description: "Знижка 10% для нових користувачів",
        minOrderAmount: 300,
        isActive: true,
      },
      {
        code: "FREESHIP",
        discount: 5,
        description: "5% знижки на доставку",
        isActive: true,
      },
    ],
  });

  console.log("Тестові дані успішно додано!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
