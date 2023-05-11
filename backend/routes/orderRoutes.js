import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { isAuth } from '../utils.js';

const orderRouter = express.Router();

const PAGE_SIZE = 5;

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const newOrder = await order.save();
    res.status(201).send({ message: 'New Order Created', newOrder });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    let query = Order.find({ user: req.user._id });
    if (req.user.isAdmin === true) {
      query = query.populate('user');
    }
    const orders = await query.exec();
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/updateDeliveryStatus',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.id);
    if (order) {
      order.isDelivered = req.body.deliveryStatus;
      if (req.body.deliveryStatus === 'true') order.deliveredAt = Date.now();
      else if (req.body.deliveryStatus === 'false') order.deliveredAt = null;

      const updatedOrder = await order.save();
      res.send({ message: 'Delivery Status Updated', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.post(
  '/searchOrderList',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const id = req.body.params.id;
      const minDate = req.body.params.minDate;
      const maxDate = req.body.params.maxDate;
      const minPrice = req.body.params.minPrice;
      const maxPrice = req.body.params.maxPrice;
      const paidStatus = req.body.params.paidStatus;
      const deliveryStatus = req.body.params.deliveryStatus;
      const page = req.body.params.pageNo;

      const name = req.body.params.name;

      const idFilter = id && id !== '' ? { _id: id } : {};
      const dateFilter =
        minDate && minDate !== '' && maxDate && maxDate !== ''
          ? { createdAt: { $gte: new Date(minDate), $lte: new Date(maxDate) } }
          : {};
      const priceFilter =
        minPrice && minPrice !== '' && maxPrice && maxPrice !== ''
          ? { totalPrice: { $gte: Number(minPrice), $lte: Number(maxPrice) } }
          : {};
      const paidStatusFilter =
        paidStatus && paidStatus !== 'all' ? { isPaid: paidStatus } : {};
      const deliveryStatusFilter =
        deliveryStatus && deliveryStatus !== 'all'
          ? { isDelivered: deliveryStatus }
          : {};

      const nameFilter =
        name && name !== ''
          ? {
              name: name,
            }
          : {};

      let userData = null;
      let userIdFilter = null;

      if (name && name !== '') {
        userData = await User.findOne({ ...nameFilter });

        if (userData) userIdFilter = { user: userData._id };
      }

      let toSearchOrder = true;

      if (name && name !== '' && userData === null) toSearchOrder = false;

      if (toSearchOrder) {
        const orders = await Order.find({
          ...idFilter,
          ...userIdFilter,
          ...dateFilter,
          ...priceFilter,
          ...paidStatusFilter,
          ...deliveryStatusFilter,
        })
          .populate('user')
          .sort({ createdAt: -1, 'user.name': 1 })
          .skip(PAGE_SIZE * (page - 1))
          .limit(PAGE_SIZE);

        const countOrders = await Order.countDocuments({
          ...idFilter,
          ...userIdFilter,
          ...dateFilter,
          ...priceFilter,
          ...paidStatusFilter,
          ...deliveryStatusFilter,
        });

        res.send({ orders, page, pages: Math.ceil(countOrders / PAGE_SIZE) });
      } else {
        res.send({ orders: null, page: 0, pages: 0 });
      }
    } catch (err) {
      res.status(404).send({ message: err });
    }
  })
);

export default orderRouter;
