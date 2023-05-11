import express from 'express';
import Product from '../models/productModel.js';
import multer from 'multer';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';

const productRouter = express.Router();

const imagePath = '../design/public/images/';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

var upload = multer({ storage: storage }).single('file');

productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

const PAGE_SIZE = 3;
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const brand = query.brand || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};

    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: 1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.post(
  '/searchProductList',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const id = req.body.params.id;
      const name = req.body.params.name;
      const brand = req.body.params.brand;
      const category = req.body.params.category;
      const minDate = req.body.params.minDate;
      const maxDate = req.body.params.maxDate;
      const minPrice = req.body.params.minPrice;
      const maxPrice = req.body.params.maxPrice;
      const page = req.body.params.pageNo;

      const idFilter = id && id !== '' ? { _id: id } : {};
      const nameFilter =
        name && name !== ''
          ? {
              name: {
                $regex: name,
                $options: 'i',
              },
            }
          : {};
      const brandFilter =
        brand && brand !== ''
          ? {
              brand: {
                $regex: brand,
                $options: 'i',
              },
            }
          : {};
      const categoryFilter =
        category && category !== ''
          ? {
              category: {
                $regex: category,
                $options: 'i',
              },
            }
          : {};

      const dateFilter =
        minDate && minDate !== '' && maxDate && maxDate !== ''
          ? { createdAt: { $gte: new Date(minDate), $lte: new Date(maxDate) } }
          : {};
      const priceFilter =
        minPrice && minPrice !== '' && maxPrice && maxPrice !== ''
          ? { price: { $gte: new Date(minPrice), $lte: new Date(maxPrice) } }
          : {};

      const products = await Product.find({
        ...idFilter,
        ...nameFilter,
        ...brandFilter,
        ...categoryFilter,
        ...dateFilter,
        ...priceFilter,
      })
        .sort({ createdAt: -1 })
        .skip(PAGE_SIZE * (page - 1))
        .limit(PAGE_SIZE);

      const countProducts = await Product.countDocuments({
        ...idFilter,
        ...nameFilter,
        ...brandFilter,
        ...categoryFilter,
        ...dateFilter,
        ...priceFilter,
      });

      res.send({ products, page, pages: Math.ceil(countProducts / PAGE_SIZE) });
    } catch (err) {
      res.status(404).send({ message: err });
    }
  })
);

productRouter.post(
  '/uploadImage',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin === true) {
      upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(500).json(err);
        } else if (err) {
          return res.status(500).json(err);
        }
      });

      return res
        .status(200)
        .send({ file: req.file, message: 'Upload Successful' });
    } else {
      res.status(202).send({ message: 'Invalid Request' });
    }
  })
);

productRouter.post(
  '/createProduct',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin === true) {
      try {
        const errorList = [];
        const nameOrSlugCheck = await Product.findOne({
          $or: [{ name: req.body.params.name }, { slug: req.body.params.slug }],
        });

        if (nameOrSlugCheck) {
          res.status(301).send({ message: 'Name Or Slug is Used' });
        } else {
          if (req.body.params.price <= 0) {
            errorList.push('Invalid Price');
          }
          if (req.body.params.countInStock < 0) {
            errorList.push('Invalid Stock Count');
          }
          if (req.body.params.rating < 0 && req.body.params.rating > 5) {
            errorList.push('Invalid Rating');
          }
          if (req.body.params.numReviews <= 0) {
            errorList.push('Invalid Review Count');
          }
          if (errorList.length === 0) {
            const newProduct = new Product({
              name: req.body.params.name,
              slug: req.body.params.slug,
              brand: req.body.params.brand,
              category: req.body.params.category,
              description: req.body.params.description,
              price: req.body.params.price,
              countInStock: req.body.params.countInStock,
              rating: req.body.params.rating,
              numReviews: req.body.params.numReviews,
              image: req.body.params.image,
            });
            const product = await newProduct.save();
            res.send({
              product: product,
              message: 'Product successfully created',
            });
          } else {
            var errorMessage = '';
            errorList.forEach((item, index) => {
              errorMessage += `${item}` + '\n';
            });
            res.status(303).send({ message: errorMessage });
          }
        }
      } catch (err) {
        res.status(404).send({ message: err });
      }
    } else {
      res.status(202).send({ message: 'Invalid Request' });
    }
  })
);

export default productRouter;
