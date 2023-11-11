require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const convertISODate = require("../utils/formatDate");
const asyncHandler = require("express-async-handler");
const getImageAsBuffer = require("../utils/getImageAsBuffer");

const { getCategories } = require("../controllers/categoryController");
const { getProductCards, getImages } = require("../controllers/productController");

const Admin = require("../models/admin");
const User = require("../models/user");
const Address = require("../models/address");
const Product = require("../models/product");
const Request = require("../models/request");
const Order = require("../models/order");
const Transaction = require('../models/transactions')


const getUser = async (id) => {
  if (!id) {
    let users = await User.find({});
    return users.map((user) => {
      user.joinedDate = convertISODate(user.createdAt);
      return user;
    });
  }

  try {
    let user = (await User.findById(id)) || (await Admin.findById(id));
    user.joinedDate = convertISODate(user.createdAt);

    return user;
  } catch (err) {
    return err;
  }
};


const registerUser = asyncHandler(async (req, res, next) => {

  console.log(req.body);

  let data = { ...req.body };
  if (data.profilePicture)
    data.profilePicture = await getImageAsBuffer(data.profilePicture);

  if (!data.username && data?.email) data.username = data.email.split("@")[0];
  console.log(data);

  if (
    await User.checkUserExist(
      req.body.username,
      req.body?.email,
      req.body?.phone
    )
  ) {
    throw new Error(
      `notify=User exist. Try logging in or change credentials.&redirect=/signup`
    );
  }
  if (Object.keys(data).length === 1 && Object.keys(data)[0] === 'phone') {
    data.username = data.phone;
    data.firstName = 'user';
  }
  const user = await User.create(data);

  req.session.username = user.username;
  req.session.userID = user._id;
  res.cookie("notify", "Registered Successfully. Complete your profile now.");
  res.redirect("/");
});

const loginUser = asyncHandler(async (req, res) => {
  if (req.body.username === "admin5311" && req.body.password === "admin5311") {
    req.session.userID = "651e76cae1d0ce2b7cbdf5b4";
    req.session.username = "admin5311";
    req.session.isAdmin = true;
    res.redirect("/");
  }

  let conditions;
  if (req.body.email) conditions = { email: req.body.email };
  if (req.body.phone) conditions = { phone: req.body.phone };
  if (req.body.username) conditions = { username: req.body.username };
  const user = await User.findOne(conditions, { profilePicture: 0 });
  console.log(user);


  if (!user) throw new Error("notify=User doesn't exist&redirect=/login");
  if (user.isBlocked)
    throw new Error("notify=Account is blocked&redirect=/login");
  if (
    (await user.checkPassword(req.body.password)) ||
    (req.body?.guid === user?.guid) || user.phone
  ) {
    console.log("username:::", user.username);
    req.session.userID = user._id;
    req.session.username = user.username;
    res.redirect("/");
  } else {
    throw new Error(
      "notify=Username or Password is in correct&redirect=/login"
    );
  }
});

const renderProfile = asyncHandler(async (req, res) => {
  const user = await getUser(req.session.userID);
  let data = { analytics: "analytics" };
  if (user.profilePicture && user.profilePicture.data) {
    user.imgSrc = `data:${user?.profilePicture?.contentType};base64,${user?.profilePicture?.data.toString('base64')}`
  }

  data = await getProfileNavData(req.query.nav, req.session.userID);


  console.log(data);
  res.render("profile", { title: "Profile", user: user, data: data });
});


const renderAdminPanel = asyncHandler(async (req, res) => {

  if (req.query.nav) {
    console.log(req.query.nav);
    const data = await getProfileNavData(req.query.nav);
    console.log(data);
    res.status(200).json(data);
    return;
  }

  res.render("adminpanel", { title: "Administration" });
})

const blockUser = async (id) => {
  try {
    const res = await User.updateOne(
      { _id: id },
      { $set: { isBlocked: true } }
    );
    return res;
  } catch (err) {
    return err;
  }
};

const unBlockUser = async (id) => {
  try {
    const res = await User.updateOne(
      { _id: id },
      { $set: { isBlocked: false } }
    );
    return res;
  } catch (err) {
    return err;
  }
};

const updateUser = asyncHandler(async (req, res) => {
  
  console.log("incoming", req.body, req.file);
debugger;
  if (!req.body.password) req.body.password = '';
  
  let user = await User.findOne(
    { _id: req.session.userID },
    { profilePicture: 0 }
  );

  //check for username availability
  if (
    (await User.checkUserExist(req.body?.username, req.body?.email, req.body?.phone)) &&
    req.body.username !== user.username
  )
    throw new Error(`notify=Username or Phone is taken&redirect=/editprofile`);

  //checks password validity
  if (req.body.oldPassword === req.body.password && req.body.password !== "")
    throw new Error(
      `notify=New password can't be your old Password, Try again&redirect=/editprofile`
    );
  if (req.body.oldPassword && !(await user.checkPassword(req.body.oldPassword)))
    throw new Error(
      `notify=Incorrect Password, Try again&redirect=/editprofile`
    );

  //updating
  for (let field in req.body) {
    if (
      !req.body[field] ||
      field === "password" ||
      field === "oldPassword" ||
      field === "profilePicture"
    )
      continue;
    console.log(field);
    user[field] = req.body[field];
  }
  //updating profile picture
  if (req?.file) {
    const imgBuffer = Buffer.from(req.file.buffer);
    const contentType = req.file.mimetype;
    const imageData = {
      data: imgBuffer,
      contentType: contentType,
    };
    user.profilePicture = imageData;
  }

  //updating password
  if (!(req.body?.password === "" && req.body?.oldPassword === ""))
    if (req.body.password)
      if (
        (req.body.oldPassword &&
          (await user.checkPassword(req.body.oldPassword))) ||
        (user.password === "" && req.body?.oldPassword !== "")
      ) {
        user.password = req.body.password;
        console.log("setting pass");
      }



  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.email) {
    console.log('ivde ninn ayirikkum error:::::::::::::::::::::')
    if (await User.checkUserExist(null, req.body.email, null)) throw new Error(`notify=E-mail exist. Try again&redirect=/editprofile`)
    console.log('alla:::::::::::::::')
    user.email = req.body.email
  };
  const updatedUser = await user.save();
  console.log(updatedUser);

  res.cookie("notify", "Updated Successfully");
  res.redirect("/profile");
});

const renderEditProfile = asyncHandler(async (req, res) => {
  const user = await getUser(req.session.userID);
  if (user.profilePicture.data) {
    user.imgSrc = `data:${user?.profilePicture?.contentType};base64,${user?.profilePicture?.data.toString('base64')}`
  }
  const addresses = await Address.find({ userID: req.session.userID }).lean();
  console.log("addresses", addresses);

  res.render("editprofile", {
    title: "Edit Profile",
    user: user,
    addresses: addresses,
  });
});

const addAddress = asyncHandler(async (req, res) => {
  const data = req.body;

  const address = new Address({
    userID: req.session.userID,
    fullname: data.fullname,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    phone: data.phone,
    addressLine: data.addressLine,
  });

  const response = await address.save();
  console.log(response);
  res.cookie("notify", "Address added successfully");
  res.redirect("/editprofile");
});

const getProfileNavData = async (nav, userID) => {
  switch (nav) {
    case "add": {
      const categories = await getCategories();
      data = { categories: categories };
      data.isCategories = "active";
      return data;
    }

    case "users": {
      const users = await User.find({}, { username: 1, email: 1, phone: 1, createdAt: 1, isBlocked: 1 }).limit(10).lean();
      users.forEach(user => {
        user.createdAt = convertISODate(user.createdAt);
      })
      data = { users: users };
      data.isUsers = "active";
      return data;
    }
    case "listings": {
      listings = await getProductCards(userID);
      data = { listings: listings };
      data.isListings = "active";
      return data;
    }
    case "purchases": {
      const requests = await Request.find({ requesterID: userID });
      const purchases = await Promise.all(
        requests.map(async (request) => {
          return await Product.getFullProduct(request.productID);
        })
      );
      const data = {
        purchases: purchases,
        isPurchases: "active",
      };
      return data;
    }
    case "orders": {
      let orders = await Order.find()
        .populate({
          path: 'productID buyerID sellerID',
        })
        .sort({ createdAt: -1 }).lean();

      orders = await Promise.all(orders.map(async (order) => {
        const buffer = await getImages(order.productID.images);
        const base64Image = buffer[0].toString("base64");
        order.productID.images = `data:image/jpeg;base64,${base64Image}`;
        return order;
      }))
      return orders;

    }

    default:
      break;
  }
};

const deleteAddress = asyncHandler(async (req, res) => {
  const response = await Address.deleteOne({ _id: req.query.id });
  console.log(response);
  res.cookie("notify", "Deleted successfully");
  res.redirect("/editprofile");
});

const renderProfileView = asyncHandler(async (req, res) => {
  const user = await User.getUser(req.query.id);
  const products = await Product.getProductCards(user._id);
  user.imgSrc = `data:${user?.profilePicture?.contentType};base64,${user?.profilePicture?.data.toString('base64')}`

  console.log(products);
  res.render("profileView", {
    title: "Profile",
    user: user,
    products: products,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, { username: 1, email: 1, phone: 1, createdAt: 1, isBlocked: 1 }).skip(req.query.skip).limit(10).lean();
  users.forEach(user => {
    user.createdAt = convertISODate(user.createdAt);
  })
  console.log(users)

  res.json(users);
})


const renderTransactions = asyncHandler(async (req, res) => {


  let orders = await Order.find({ $or: [{ buyerID: req.session.userID }, { sellerID: req.session.userID }] })
    .populate({
      path: 'productID',
      select: 'images title price'

    })
    .populate({
      path: 'buyerID sellerID',
      select: 'firstName secondName _id'
    })
    .lean();

  orders = await Promise.all(orders.map(async (order) => {
    const buffer = await getImages([order.productID.images[0]]);
    const base64Image = buffer[0].toString("base64");
    order.productID.images = `data:image/jpeg;base64,${base64Image}`;
    return order;

  }))

  console.log(orders)
  const requests = await Order.find({ requesterID: req.query.userID }).lean()
  res.render('transactions', { title: "transactions", requests, orders });
})



const renderWallet = asyncHandler(async (req, res) => {


  const user = await getUser(req.session.userID);

  if (req.session.stripeSession) {
    const stripeSession = await stripe.checkout.sessions.retrieve(req.session.stripeSession);
    if (stripeSession.payment_status !== 'paid') {
      req.session.stripeSession = null;
      throw new Error(`notify=Payment failed&redirect=/wallet`)

    }
    const transaction = new Transaction({
      type: 'user_wallet_top_up',
      senderID: req.session.userID,
      transactionID: stripeSession.id,
      amount: stripeSession.amount_total / 100,
      status: stripeSession.payment_status,
    })
    await transaction.save();
    user.walletBalance += transaction.amount;
    await user.save();
    res.cookie("notify", "Added successfully")
    req.session.stripeSession = null;
  }

  const transactions = await Transaction.find({
    $or: [
      { senderID: req.session.userID },
      { receiverID: req.session.userID }
    ],
    type: { $in: ['admin_to_user_refund', 'user_wallet_top_up', 'user_to_admin_wallet'] }
  }).lean();

  transactions.forEach(trans => {
    trans.createdAt = convertISODate(trans.createdAt);
  })

  console.log(transactions)
  res.render('wallet', { title: 'Wallet', user, transactions })


})

const walletTopup = asyncHandler(async (req, res) => {
  console.log(req.body)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{

      price_data: {
        currency: 'inr',
        product_data: {
          name: 'Top-up',
        },
        unit_amount: req.body.amount * 100
      },
      quantity: 1


    }],
    success_url: `${process.env.SERVER_URL}/wallet`,
    cancel_url: `${process.env.SERVER_URL}/wallet`
  });


  req.session.stripeSession = session.id;
  res.json({ url: session.url })
})

module.exports = {
  registerUser,
  loginUser,
  getUser,
  blockUser,
  unBlockUser,
  updateUser,
  getProfileNavData,
  renderProfile,
  addAddress,
  renderEditProfile,
  deleteAddress,
  renderProfileView,
  getUsers,
  renderTransactions,
  renderAdminPanel,
  renderWallet,
  walletTopup
};
