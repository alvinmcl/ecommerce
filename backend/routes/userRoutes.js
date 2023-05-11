import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken, isAuth } from '../utils.js';

const userRouter = express.Router();

const PAGE_SIZE = 5;

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid Email or Password' });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.body.password !== req.body.confirmPassword) {
      res.status(400).send({ message: 'Password does not match' });
    } else {
      const user = await User.findById(req.user._id);
      if (user) {
        if (req.body.password) {
          user.password = bcrypt.hashSync(req.body.password, 8);
        }

        const updatedUser = await user.save();
        res.send({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          token: generateToken(updatedUser),
        });
      } else {
        res.status(404).send({ message: 'User not found' });
      }
    }
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const nameOrEmailCheck = await User.findOne({
      $or: [{ name: req.body.name }, { email: req.body.email }],
    });

    if (nameOrEmailCheck) {
      res.status(301).send({ message: 'Email Or Name is Used' });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
      });
      const user = await newUser.save();
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    }
  })
);

userRouter.post(
  '/searchUserList',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const id = req.body.params.id;
      const email = req.body.params.email;
      const minDate = req.body.params.minDate;
      const maxDate = req.body.params.maxDate;
      const isAdminStatus = req.body.params.isAdminStatus;
      const page = req.body.params.pageNo;

      const name = req.body.params.name;

      const idFilter = id && id !== '' ? { _id: id } : {};
      const emailFilter = email && email !== '' ? { email: email } : {};

      const dateFilter =
        minDate && minDate !== '' && maxDate && maxDate !== ''
          ? { createdAt: { $gte: new Date(minDate), $lte: new Date(maxDate) } }
          : {};

      const isAdminStatusFilter =
        isAdminStatus && isAdminStatus !== 'all'
          ? { isAdmin: isAdminStatus }
          : {};

      const nameFilter = name && name !== '' ? { name: name } : {};

      const users = await User.find({
        ...idFilter,
        ...nameFilter,
        ...emailFilter,
        ...dateFilter,
        ...isAdminStatusFilter,
      })
        .sort({ createdAt: -1, isAdmin: 1 })
        .skip(PAGE_SIZE * (page - 1))
        .limit(PAGE_SIZE);

      const countUsers = await User.countDocuments({
        ...idFilter,
        ...nameFilter,
        ...emailFilter,
        ...dateFilter,
        ...isAdminStatusFilter,
      });

      res.send({ users, page, pages: Math.ceil(countUsers / PAGE_SIZE) });
    } catch (err) {
      res.status(404).send({ message: err });
    }
  })
);

userRouter.post(
  '/createUser',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin === true) {
      try {
        const nameOrEmailCheck = await User.findOne({
          $or: [
            { name: req.body.params.name },
            { email: req.body.params.email },
          ],
        });

        if (nameOrEmailCheck) {
          res.status(301).send({ message: 'Email Or Name is Used' });
        } else {
          const newUser = new User({
            name: req.body.params.name,
            email: req.body.params.email,
            password: bcrypt.hashSync(req.body.params.password),
            isAdmin: req.body.params.isAdmin,
          });
          const user = await newUser.save();
          res.send({ user: user, message: 'User successfully created' });
        }
      } catch (err) {
        res.status(404).send({ message: err });
      }
    } else {
      res.status(202).send({ message: 'Invalid Request' });
    }
  })
);

export default userRouter;
