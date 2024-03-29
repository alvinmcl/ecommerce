import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'admin',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123123'),
      isAdmin: true,
    },
    {
      name: 'user',
      email: 'user@example.com',
      password: bcrypt.hashSync('123123'),
      isAdmin: false,
    },
  ],
  products: [
    {
      name: 'Tabby Cat 1',
      slug: 'tabby-cat-1',
      category: 'Cat',
      image: '/images/p1.JPG',
      price: 120,
      countInStock: 2,
      brand: 'Tabby',
      rating: 3.0,
      numReviews: 5,
      description: 'brown tabby cat',
    },
    {
      name: 'White Kitten 1',
      slug: 'white-kitten-1',
      category: 'Kitten',
      image: '/images/p2.JPG',
      price: 1020,
      countInStock: 1,
      brand: 'White',
      rating: 3.6,
      numReviews: 20,
      description: 'white kitten',
    },
    {
      name: 'White Kitten 2',
      slug: 'white-kitten-2',
      category: 'Kitten',
      image: '/images/p3.JPG',
      price: 600,
      countInStock: 2,
      brand: 'White',
      rating: 4.0,
      numReviews: 50,
      description: 'white kitten',
    },
    {
      name: 'Black Cat 1',
      slug: 'black-cat-1',
      category: 'Cat',
      image: '/images/p4.JPG',
      price: 220,
      countInStock: 0,
      brand: 'Black',
      rating: 4.5,
      numReviews: 20,
      description: 'Black cat',
    },
  ],
};

export default data;
