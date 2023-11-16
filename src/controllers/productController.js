const mongoose = require("mongoose");
const axios = require('axios')
const geolib = require("geolib");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const asyncHandler = require("express-async-handler");
const fs = require('fs');
const ejs = require('ejs')
const puppeteer = require('puppeteer')

const Product = require("../models/product");
const Address = require("../models/address");
const User = require("../models/user");
const { Category, SubCategory } = require("../models/category");
const Request = require("../models/request");
const Order = require('../models/order')
const Configuration = require('../models/configuration');
const Courier = require('../models/courier')
const Transaction = require('../models/transactions');
const Admin = require('../models/admin')
const convertISODate = require("../utils/formatDate");



const isInRadius = (cord1, cord2, distance) => {
  console.log(cord1, cord2, distance);

  if (geolib.getDistance(cord1, cord2) > distance * 1000) return false;
  return true;
};

let db, bucket;
mongoose.connection.on("connected", () => {
  db = mongoose.connection.db;
  bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "images" });
});



const saveProduct = asyncHandler(async (item, images) => {
  const { name, city, lat, lon } = JSON.parse(item.location);
  const location = {
    name,
    city,
    lat,
    lon,
  };

  if (item.buyNow === "on") item.buyNow = true;
  else item.buyNow = false;

  const imageIDs = await saveImgs(images);
  const product = new Product({
    title: item.title,
    category: item.category,
    subCategory: item.subCategory,
    location: location,
    price: item.price,
    description: item.description,
    details: JSON.parse(item.details),
    images: imageIDs,
    userID: item.userID,
    buyNow: item?.buyNow
  });

  const data = await product.save();
});

const addProduct = asyncHandler(async (req, res) => {

  console.log('request::::', req.body)
  try {
    const product = req.body;
    product.userID = req.session.userID;
    const data = await saveProduct(product, req.files);
    res.cookie("notify", "Posted successfully.")
    res.status(200).json({ message: 'Added successfully' })
  }
  catch (err) {
    console.log(err);
    err.redirect('/product/post');
    res.cookie("notify", "Something went wrong.")
    res.status(400).json({ message: 'Error adding product' });
    return err;
  }

})



const saveImgs = asyncHandler(async (files) => {

  const imageIds = [];
  for (const file of files) {
    const uploadStream = await bucket.openUploadStream(file.originalname);
    const res = await uploadStream.end(file.buffer);
    imageIds.push(res.id);
  }
  return imageIds;
});


async function getImages(imageIDs) {
  const images = await Promise.all(
    [...imageIDs].map(async (id) => {
      let chunks = [];
      const downloadStream = await bucket.openDownloadStream(id);

      return new Promise((resolve, reject) => {
        downloadStream.on("data", (chunk) => {
          chunks.push(chunk);
        });

        downloadStream.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      });
    })
  );

  return images;
}

const getProductCards = async (id) => {
  let products;
  if (id) {
    products = await Product.find(
      { userID: id },
      { images: 1, price: 1, title: 1, location: 1, createdAt: 1, isListed: 1 }
    ).lean();
  } else {
    products = await Product.find(
      {},
      { images: 1, price: 1, title: 1, location: 1, createdAt: 1 }
    ).lean();
  }
  for (let product of products) {
    product.images = await getImages(product.images);
    product.createdAt = convertISODate(product.createdAt);
    product.location = product.location.name;
  }

  return products;
};

const renderProduct = asyncHandler(async (req, res, next) => {

  console.log('reqqqqqq', req.query.id)

  const order = await Order.findOne({ productID: req.query.id, buyerID: req.session.userID });
  if (order) {
    res.redirect(`/product/buyStatus?id=${req.query.id}`)
  } else {


    const product = await Product.getFullProduct(req.query.id);
    const user = await User.findOne(
      { _id: product.userID },
      { profilePicture: 1, firstName: 1, secondName: 1 }
    );
    const request = await Request.findOne({
      requesterID: req.session?.userID,
      productID: req.query.id,
    });

    const requests = await Request.find({ productID: req.query.id })
      .populate({
        path: 'requesterID',
        select: 'firstName secondName _id'
      });
    console.log(requests)

    if (user?.profilePicture)
      user.imgSrc = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString('base64')}`

    res.render("product", {
      title: "Product",
      product,
      user,
      request,
      requests
    });
  }
});

const renderEdit = asyncHandler(async (req, res) => {
  console.log("query params", req.query.id);

  const categories = await Category.find({});
  const product = await Product.getFullProduct(req.query.id);
  console.log(product);
  res.render("editProduct", {
    title: "Edit Product",
    categories: categories,
    product: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  console.log(req.body);

  const product = await Product.findOne({ _id: req.query.productID });
  const {
    title,
    category,
    subCategory,
    location,
    price,
    description,
    details,
    imgRemoveData,
  } = req.body;

  let buyNow = false;
  if (req.body.buyNow === 'on') buyNow = true;

  product.title = title;
  product.category = category;
  product.subCategory = subCategory;
  if (location && JSON.parse(location)) product.location = JSON.parse(location);
  product.price = price;
  product.description = description;
  product.details = JSON.parse(details);
  product.buyNow = buyNow;
  console.log(product.details);

  const newImages = await saveImgs(req.files);

  product.images.push(...newImages);

  product.images = product.images.filter((img, index) => {
    if (imgRemoveData.includes(index.toString())) return false;
    return true;
  });

  const savedProduct = await product.save();
  console.log(savedProduct);
  res.cookie("notify", "Product updated successfully");
  res.status(200).json({ message: "Updated successful" });
});

const renderSearch = asyncHandler(async (req, res) => {
  console.log(req.query);
  let {
    search: searchQuery,
    category,
    subCategory,
    sort,
    lat,
    lon,
    distance,
    minPrice,
    maxPrice,
    page
  } = req.query;

  if (!searchQuery) {
    searchQuery = "";
  }

  console.log(searchQuery, category, subCategory, sort, lat, lon);

  let sortConditions = { specificity: 1 };

  switch (sort) {

    case "rel":
      sortConditions = {};
      sortConditions.specificity = 1;
      break;
    case "plth":
      sortConditions = {};
      sortConditions.price = 1;
      break;
    case "phtl":
      sortConditions = {};
      sortConditions.price = -1;
      break;
    case "date":
      sortConditions = {};
      sortConditions.createdAt = -1;
      break;
  }

  const matchConditions = [
    {
      isListed: true,
    },
    {
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { details: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { subCategory: { $regex: searchQuery, $options: 'i' } }
      ],
    },
  ];

  if (category)
    matchConditions.push({ category: category });
  if (subCategory)
    matchConditions.push({
      subCategory: subCategory,
    });

  if (minPrice && maxPrice) {
    matchConditions.push({
      price: {
        $gte: parseFloat(minPrice), // Greater than or equal to minPrice
        $lte: parseFloat(maxPrice), // Less than or equal to maxPrice
      },
    });
  }
  console.log(matchConditions);

  if (!page) page = 0

  const skipCount = parseInt(page) * 9
  console.log('skipCount:::::::::::;', skipCount)

  let products = await getQueryStateProduct(matchConditions, sortConditions, searchQuery, skipCount);
  console.log(products[0])


  if (distance) {
    if (!lat || !lon)
      throw new Error(`notify=Add location&redirect=/search?search=`);
    products = products.filter((item) => {
      if (item.location.lat) {
        const res = isInRadius(
          {
            latitude: parseFloat(item.location.lat),
            longitude: parseFloat(item.location.lon),
          },
          { latitude: parseFloat(lat), longitude: parseFloat(lon) },
          parseFloat(distance)
        );

        return res;
      }
    });
  }

  const productPromises = products.map(async (product) => {
    product.images = await getImages([product.images]);
    product.createdAt = convertISODate(product.createdAt);
    product.location = product.location.name;
    return product;
  });

  let formatedProducts = await Promise.all(productPromises);

  if (sort || category || subCategory || distance || minPrice) {
    formatedProducts.forEach((item) => {
      const buffer = item.images[0];
      const base64Image = buffer.toString("base64");
      item.images = `data:image/jpeg;base64,${base64Image}`;
    });
    res.status(200).json(formatedProducts);
  } else {
    let userWishlist;
    if (req.session.userID) {
      userWishlist = await User.findOne(
        { _id: req.session.userID },
        { wishlist: 1 }
      );
      userWishlist = userWishlist?.wishlist;
    }
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "categoryID",
          as: "subCategories",
        },
      },
      {
        $project: {
          name: 1,
          _id: 1,
          subCategories: { name: 1, _id: 1 },
        },
      },
    ]);
    res.render("search", {
      title: "Search",
      products: formatedProducts,
      categories: categories,
      wishlist: userWishlist,
      searchParam: searchQuery,
    });
  }
});

const toggleListedStatus = asyncHandler(async (req, res) => {
  const response = await Product.toggleListedStatus(req.query.id);

  if (response.isListed) res.status(200).json({ message: true });
  else res.status(200).json({ message: false });
});

const addRequest = asyncHandler(async (req, res) => {
  const request = new Request({
    requesterID: req.session.userID,
    productID: req.query.productID,
    amount: req.query?.amount,
  });

  const data = await request.save();
  console.log(data);
  res.cookie("notify", "Requested Successfully");
  res.redirect(`/product?id=${req.query.productID}`);
});

const toggleWishlist = asyncHandler(async (req, res) => {
  let response;
  const user = await User.findOne({ _id: req.session.userID }, { wishlist: 1 });

  if (user.wishlist.indexOf(req.query.productID) === -1) {
    response = await User.updateOne(
      { _id: req.session.userID },
      { $addToSet: { wishlist: req.query.productID } }
    );
    res.status(200).json({ message: true });
  } else {
    response = await User.updateOne(
      { _id: req.session.userID },
      { $pull: { wishlist: req.query.productID } }
    );
    res.status(200).json({ message: false });
  }

});

const cancelRequest = asyncHandler(async (req, res) => {
  const response = await Request.deleteOne({
    requesterID: req.session.userID,
    productID: req.query.productID,
  });
  console.log(response);
  if (response.deletedCount) {
    res.cookie("notify", "Cancelled Request");
    res.redirect(`/product?id=${req.query.productID}`);
  } else {
    throw new Error("Something went wrong");
  }
});

const renderStatus = asyncHandler(async (req, res) => {

  let order, courier;
  order = await Order.findOne({ productID: req.query.productID }).populate({
    path: 'buyerID',
    select: 'firstName secondName _id'
  }).populate({
    path: 'address'
  }).populate({
    path: 'sellerID',
    select: 'firstName secondName _id'
  }).populate({
    path: 'productID',
    select: 'location price title images'
  }).lean()

  console.log('orderrrrr', order);
  if (order) {

    order.productID.images = await getImages(order.productID.images);

    const buffer = order.productID.images[0];
    const base64Image = buffer.toString("base64");
    order.productID.images = `data:image/jpeg;base64,${base64Image}`;

  }


  const requests = await Request.find({
    productID: req.query.productID,
  }).populate({
    path: "requesterID",
    model: "User",
    select: "firstName secondName",
  });

  courier = await Courier.findOne({ productID: req.query.productID });


  res.render("status", { title: "Status", requests, order, courier });
});

const acceptRequest = asyncHandler(async (req, res) => {
  console.log(req.query.requestID);
  console.log(req.query.to)
  const to = JSON.parse(req.query.to);
  const response = await Request.updateOne(
    { _id: req.query.requestID },
    { $set: { isAccepted: to } }
  );
  console.log(response);
  if (!response.modifiedCount) throw new Error(`Couldn't update request`);
  res.redirect(`/product/status?productID=${req.query.productID}`);
});

const renderLanding = asyncHandler(async (req, res) => {
  const products = await Product.find({ isListed: true, }, { images: 1, title: 1, location: 1, createdAt: 1, price: 1 }).limit(8).lean();
  let orders = await Order.find({},{productID:1});
  orders = orders.map(order=>order.productID.toString())
  let productCards = await Promise.all(products.map(async (product) => {
    product.images = await getImages(product.images);
    product.createdAt = convertISODate(product.createdAt);
    
    if(!orders.includes(product._id.toString()))
    return product;
  }))

  productCards = productCards.filter(card=>{
    if(card)return true;
  })

  

  res.render('landing', { title: 'Home', products: productCards });
});

const renderCheckout = asyncHandler(async (req, res) => {
  const productPromise = Product.getFullProduct(req.query.productID);
  const addressesPromise = Address.find({ userID: req.session.userID });
  const requestPromise = Request.findOne({ productID: req.query.productID, requesterID: req.session.userID });
  const userPromise = User.findOne({ _id: req.session.userID }, { walletBalance: 1 });
  const configurationPromise = Configuration.findOne({ name: 'transactionFeePercent' });

  const [product, addresses, request, user, configuration] = await Promise.all([productPromise, addressesPromise, requestPromise, userPromise, configurationPromise]);


  res.render("checkout", {
    title: "Checkout",
    product,
    addresses,
    request,
    user,
    transactionFeePercentage: configuration.value
  });
});





const placeOrder = asyncHandler(async (req, res) => {

  console.log(req.body);

  const product = await Product.findOne({ _id: req.body.productID });
  const configuration = await Configuration.findOne({ name: 'transactionFeePercent' });

  if (req.body.paymentMethod === 'wallet') {
    const user = await User.findOneAndUpdate(
      { _id: req.session.userID },
      { $inc: { walletBalance: -req.body.price } },
      { new: true }
    ).lean();

    const admin = await Admin.findOneAndUpdate({ role: 'admin' }, { $inc: { walletBalance: req.body.price } }, { new: true }).lean();

    let order = new Order({
      buyerID: req.session.userID,
      sellerID: product.userID,
      productID: req.body.productID,
      price: {
        transactionPercent: configuration.value,
        totalPrice: req.body.price,
        listPrice: product.price
      },
      address: req.body.address,
      stripeTransactionId: 'wallet'
    })
    order = await order.save();

    const transaction = new Transaction({
      type: 'user_to_admin_wallet',
      senderID: req.session.userID,
      toAdmin: true,
      status: 'paid',
      amount: req.body.price,
      order: order._id
    });

    await transaction.save()

    res.redirect(`buyStatus?id=${req.body.productID}`);

  } else {



    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{

        price_data: {
          currency: 'inr',
          product_data: {
            name: req.body.productTitle,
          },
          unit_amount: req.body.price * 100
        },
        quantity: 1


      }],
      success_url: `${process.env.SERVER_URL}/product/buyStatus?id=${req.body.productID}`,
      cancel_url: `${process.env.SERVER_URL}/product?id=${req.body.productID}`
    })

    req.session.order = { stripeTransactionId: session.id, address: req.body.address, requestedAmont: req.body.price };
    console.log(session.url);
    res.status(200).json({ url: session.url })
  }



});




const renderBuyStatus = asyncHandler(async (req, res) => {


  let order, courier;

  const product = await Product.getFullProduct(req.query.id);
  const configuration = await Configuration.findOne({ name: 'transactionFeePercent' });



  if (req.session.order && req.session.order.stripeTransactionId) {

    const { stripeTransactionId, address, requestedAmont } = req.session.order;
    console.log(stripeTransactionId, address)
    const stripeSession = await stripe.checkout.sessions.retrieve(req.session.order.stripeTransactionId);
    const order = new Order({
      buyerID: req.session.userID,
      sellerID: product.userID,
      productID: req.query.id,
      price: {
        transactionPercent: configuration.value,
        totalPrice: stripeSession.amount_total / 100,
        listPrice: requestedAmont / (1 + (configuration.value / 100))
      },
      address,
      stripeTransactionId
    })
    const data = await order.save();
    if (!data) throw new Error(`Couldn't save order details`);
    const transaction = new Transaction({
      type: 'user_to_admin_stripe',
      senderID: req.session.userID,
      toAdmin: true,
      status: stripeSession.payment_status,
      amount: stripeSession.amount_total / 100,
      order: data._id
    });
    await transaction.save()
    await Admin.findOneAndUpdate({ role: 'admin' }, { $inc: { walletBalance: stripeSession.amount_total / 100 } });
    res.cookie("notify", "Order placed successfully");
    req.session.order = null;
  }





  order = await Order.findOne({ productID: req.query.id }).populate({
    path: 'buyerID',
    select: 'firstName secondName _id'
  }).populate({
    path: 'address'
  }).populate({
    path: 'sellerID',
    select: 'firstName secondName _id'
  }).populate({
    path: 'productID',
    select: 'location price title images'
  }).lean()

  order.productID.images = await getImages(order.productID.images);

  const buffer = order.productID.images[0];
  const base64Image = buffer.toString("base64");
  order.productID.images = `data:image/jpeg;base64,${base64Image}`;

  courier = await Courier.findOne({ productID: req.query.id });


  console.log('order:::::::::', order)



  res.render('buyStatus', { title: 'Status', order, courier })

})


const addCourier = asyncHandler(async (req, res) => {

  console.log(req.body)
  const response = await axios.post('https://api.ship24.com/public/v1/trackers/track', {
    trackingNumber: req.body.courierID,
  }, {
    headers: {
      Authorization: 'Bearer apik_ziSjYIP3ZNKLxUXWABTzPgmjoZbYid',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

  console.log(response.data)
  const trackerID = response.data.data.trackings[0].tracker.trackerId;
  const status = response.data.data.trackings[0].shipment.statusMilestone
  console.log('trackerID', trackerID)

  

  console.log(response);
  const order = await Order.findOne({ productID: req.body.productID });
  order.status = status;
  const courier = new Courier({
    carrier: req.body.carrier,
    courierID: req.body.courierID.trim(),
    productID: req.body.productID,
    trackerID,
    status
  });
  const data = await courier.save();
  if (!data) throw new Error("couldn't add courier details");

  if ((status === 'delivered' || status.includes('delivered')) && !order.paidToSeller ) {
    await User.findOneAndUpdate({ _id: order.sellerID }, { $inc: { walletBalance: order.price.listPrice } });
    await Admin.findOneAndUpdate({ role: 'admin' }, { $inc: { walletBalance: -order.price.listPrice } });

    const transaction = new Transaction({
      type: 'admin_to_user_payment',
      receivedID: order.sellerID,
      fromAdmin: true,
      amount: order.price.listPrice,
      status: 'paid',
      order: order._id
    })

    order.paidToSeller = true;
    console.log(transaction)
    await transaction.save();


  }

  await order.save();




  res.redirect(`/product/status?productID=${req.body.productID}`);

})

const getOrders = asyncHandler(async (req, res) => {
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
  console.log(orders[0]);
  res.json(orders);
})

const getOrderStatus = asyncHandler(async (req, res) => {
  console.log(req.query.trackerID)
  const trackerID = req.query.trackerID;

  const response = await axios.get(`https://api.ship24.com/public/v1/trackers/${trackerID}/results`, {
    headers: {
      Authorization: 'Bearer apik_ziSjYIP3ZNKLxUXWABTzPgmjoZbYid'
    },
  });
  const status = response.data.data.trackings[0].shipment.statusMilestone;
  console.log(status)
  const courier = await Courier.findOne({ trackerID });
  courier.status = status;
  await courier.save();
  console.log(courier)
  const order = await Order.findOne({ productID: courier.productID });
  order.status = status;
  console.log(order);
  
  if ((status === 'delivered' || status.includes('delivered')) && !order.paidToSeller ) {
    await User.findOneAndUpdate({ _id: order.sellerID }, { $inc: { walletBalance: order.price.listPrice } });
    await Admin.findOneAndUpdate({ role: 'admin' }, { $inc: { walletBalance: -order.price.listPrice } });

    const transaction = new Transaction({
      type: 'admin_to_user_payment',
      receivedID: order.sellerID,
      fromAdmin: true,
      amount: order.price.listPrice,
      status: 'paid',
      order: order._id
    })
    
    order.paidToSeller = true;
    console.log(transaction)
    await transaction.save();


  }
  const orderRes = await order.save()

  res.json(status)
})

const getWishlist = asyncHandler(async (req, res) => {


  let wishlist = await User.findOne({ _id: req.session.userID }, { wishlist: 1 }).lean();
  wishlist = wishlist.wishlist;
  console.log(wishlist);

  const products = await Promise.all(wishlist.map(async (id) => {
    return Product.getFullProduct(id);
  }))

  console.log(products)

  res.json(products);


})

const webhook = asyncHandler(async (req, res) => {
  console.log(req.body);
  console.log(req.body.trackings[0].shipment);


  const courierID = req.body.trackings[0].shipment.trackingNumbers[0].tn;
  const status = req.body.trackings[0].shipment.statusMilestone;

  const courier = await Courier.findOne({ courierID });
  courier.status = status;
  await courier.save();
  const order = await Order.findOne({ productID: courier.productID });
  order.status = status;
  console.log(order)
  if ((status === 'delivered' || status.includes('delivered')) && !order.paidToSeller ) {
    await User.findOneAndUpdate({ _id: order.sellerID }, { $inc: { walletBalance: order.price.listPrice } });
    await Admin.findOneAndUpdate({ role: 'admin' }, { $inc: { walletBalance: -order.price.listPrice } });
    
    const transaction = new Transaction({
      type: 'admin_to_user_payment',
      receivedID: order.sellerID,
      fromAdmin: true,
      amount: order.price.listPrice,
      status: 'paid',
      order: order._id
    })

    console.log(transaction)
    await transaction.save();
    order.paidToSeller = true;
    
  }

  await order.save();
  
  res.status(200).json({ message: 'Success' });
})



const downloadOrderDetails = asyncHandler(async (req, res) => {

  const {productID,type} = req.query;

  const order = await Order.findOne({productID}).populate({
    path:'sellerID buyerID productID address'
  }).lean()

  let file;

  if(type === 'buyer'){
    file = fs.readFileSync('./views/downloads/orderDetails.ejs', 'utf-8');
  }else{
    file = fs.readFileSync('./views/downloads/orderDetailsSeller.ejs', 'utf-8');
  }

  const html = ejs.render(file,{order});

  
   
    const browser = await puppeteer.launch();

 
    const page = await browser.newPage();

   
    await page.setContent(html);

  
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });

    await browser.close();

    res.setHeader('Content-Disposition', `attachment; filename="orderDetail.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    res.end(pdfBuffer);


  
 
});


// downloadOrderDetails()



module.exports = {
  saveProduct,
  saveImgs,
  getProductCards,
  getImages,
  renderProduct,
  renderEdit,
  updateProduct,
  renderSearch,
  toggleListedStatus,
  addRequest,
  toggleWishlist,
  cancelRequest,
  renderStatus,
  acceptRequest,
  renderLanding,
  renderCheckout,
  placeOrder,
  renderBuyStatus,
  addCourier,
  addProduct,
  getOrders,
  getOrderStatus,
  webhook,
  getWishlist,
  downloadOrderDetails
};



const getQueryStateProduct = async (matchConditions, sortConditions, searchQuery, skipCount) => {
  console.log(skipCount)
  matchConditions.push({ orders: { $size: 0 } });
  const products = await Product.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'productID',
        as: 'orders'
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategory'
      }
    },
    {
      $addFields: {
        category: {
          $arrayElemAt: ['$category.name', 0]
        },
        subCategory: {
          $arrayElemAt: ['$subCategory.name', 0]
        }
      }
    },
    {
      $match: {
        $and: matchConditions,
      },
    },
    {
      $addFields: {
        specificity: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$title", regex: searchQuery, options: "i" } }, then: 1 },
              // { case: { $regexMatch: { input: "$details", regex: searchQuery, options: "i" } }, then: 2 },
              { case: { $regexMatch: { input: "$description", regex: searchQuery, options: "i" } }, then: 5 },
              {
                case: {
                  $regexMatch: { input: "$category", regex: searchQuery, options: "i" },
                },
                then: 4
              },
              {
                case: {
                  $regexMatch: { input: "$subCategory", regex: searchQuery, options: "i" },
                },
                then: 3
              }
            ],
            default: 10
          }
        }
      }
    },
    {
      $sort: sortConditions,
    },
    {
      $project: {
        images: { $arrayElemAt: ["$images", 0] },
        price: 1,
        title: 1,
        location: 1,
        category: 1,
        subCategory: 1,
        createdAt: 1,
        userID: 1,
        specificity: 1
      },
    },
    {
      $skip: skipCount
    },
    {
      $limit: 9
    }
  ]);

  return products;
};

