const hairServicesData = [
  {
    _id: 1,
    title: "Single Box Braids",
    price: 90,
    imageLink: "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
    category: "Box Braids",
    duration: 4,
  },
  {
    _id: 1,
    title: "Medium Knotless Braids",
    price: 110,
    imageLink: "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
    category: "Knotless",
    duration: 5,
    addOns: [
      {
        title: "Beads Decoration",
        price: 10,
        duration: 0.5,
      },
      {
        title: "Extra Length",
        price: 15,
        duration: 1,
      },
    ],
  },
  {
    _id: 1,
    title: "Classic Cornrows",
    price: 65,
    imageLink: "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
    category: "Cornrows",
    duration: 2,
  },
  {
    _id: 1,
    title: "Two Strand Twists",
    price: 80,
    imageLink: "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
    category: "Twists",
    duration: 3,
  },
  {
    _id: 1,
    title: "Dread Retwist",
    price: 100,
    imageLink: "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
    category: "Dreads",
    duration: 3.5,
    addOns: [
      {
        title: "Scalp Treatment",
        price: 20,
        duration: 0.5,
      },
    ],
  },
];

export const getServicesByCategory = () => {
  let groupedServices = {};

  hairServicesData?.forEach((service) => {
    const category = service.category;
    if (!groupedServices[category]) {
      groupedServices[category] = [];
    }
    groupedServices[category].push(service);
  });

  return groupedServices;
};

export const getHairService = (search) => {
  const item = hairServicesData?.find(
    (service) => service?.title === search?.title
  );

  return item ? item[0] : [];
};

export default hairServicesData;
