const mongoose = require("mongoose");
const geolib = require("geolib");

const Product = require("../models/product");
const Address = require("../models/address");
const User = require("../models/user");
const convertISODate = require("../utils/formatDate");
const asyncHandler = require("express-async-handler");
const { Category, SubCategory } = require("../models/category");
const Request = require("../models/request");
const product = require("../models/product");
const getImageAsBuffer = require("../utils/getImageAsBuffer");

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)



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

  console.log("location", location);

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
  });

  const data = await product.save();
});

const saveImgs = asyncHandler(async (files) => {
  //returns an array of IDs of images after saving

  const imageIds = [];
  for (const file of files) {
    const uploadStream = await bucket.openUploadStream(file.originalname);
    const res = await uploadStream.end(file.buffer);
    imageIds.push(res.id);
  }
  return imageIds;
});

const isInRadius = (cord1, cord2, distance) => {
  console.log(cord1, cord2, distance);

  if (geolib.getDistance(cord1, cord2) > distance * 1000) return false;
  return true;
};

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

const renderProduct = asyncHandler(async (req, res) => {
  const product = await Product.getFullProduct(req.query.id);
  const user = await User.findOne(
    { _id: product.userID },
    { profilePicture: 1, firstName: 1, secondName: 1 }
  );
  const request = await Request.findOne({
    requesterID: req.session?.userID,
    productID: req.query.id,
  });

  res.render("product", {
    title: "Product",
    product: product,
    user: user,
    request: request,
  });
});

const renderEdit = asyncHandler(async (req, res) => {
  console.log("query params", req.query.id);
  const categories = await Category.find({});
  const product = await Product.getFullProduct({ _id: req.query.id });
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

  product.title = title;
  product.category = category;
  product.subCategory = subCategory;
  if (location && JSON.parse(location)) product.location = JSON.parse(location);
  product.price = price;
  product.description = description;
  product.details = JSON.parse(details);
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
  } = req.query;

  if (searchQuery || searchQuery) {
    searchQuery = "";
  }

  console.log(searchQuery, category, subCategory, sort, lat, lon);

  let sortConditions = { createdAt: -1 };

  switch (sort) {
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
        { category: { $regex: searchQuery, $options: "i" } },
        { subCategory: { $regex: searchQuery, $options: "i" } },
      ],
    },
  ];

  if (category)
    matchConditions.push({ category: new mongoose.mongo.ObjectId(category) });
  if (subCategory)
    matchConditions.push({
      subCategory: new mongoose.mongo.ObjectId(subCategory),
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

  let products = await getQueryStateProduct(matchConditions, sortConditions);

  //    console.log(products);

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
      userWishlist = userWishlist.wishlist;
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
      searchParam: req.query.search,
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

  // res.status(500).json({ message: 'Something went wrong' })
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
  const requests = await Request.find({
    productID: req.query.productID,
  }).populate({
    path: "requesterID",
    model: "User",
    select: "firstName secondName",
  });

  console.log(requests);

  res.render("status", { title: "Status", requests });
});

const acceptRequest = asyncHandler(async (req, res) => {
  console.log(req.query.requestID);
  const response = await Request.updateOne(
    { _id: req.query.requestID },
    { $set: { isAccepted: true } }
  );
  console.log(response);
  if (!response.modifiedCount) throw new Error(`Couldn't update request`);
  res.redirect(`/product/status?productID=${req.query.productID}`);
});

const renderLanding = asyncHandler(async (req, res) => {
  // const products = await Product.find({}, { images: 1, title: 1, location: 1, createdAt: 1, price: 1 }).limit(8).lean();
  // const productCards = await Promise.all(products.map(async (product) => {
  //     product.images = await getImages(product.images);
  //     product.createdAt = convertISODate(product.createdAt);
  //     return product;

  // }))
  // res.render('landing', { title: 'Home', products: productCards });
  res.render("landing", { title: "Home" });
});

const renderCheckout = asyncHandler(async (req, res) => {
  const product = await Product.getFullProduct(req.query.productID);
  const addresses = await Address.find({ userID: req.session.userID });
  res.render("checkout", {
    title: "Checkout",
    product: product,
    addresses: addresses,
  });
});


/*const stripe = require('stripe')('sk_test_51NvA0wSASzCg3MyV7b4YT44fdTCN29ZuaAGr7BzsCrfsepIM1o2nWb1H3K1kmqKXv7h88pQY7OCUofKKj7Ox6jan00dBjSGHWC');

const session = await stripe.checkout.sessions.create({
  success_url: 'https://example.com/success',
  line_items: [
    {price: 'price_H5ggYwtDq4fbrJ', quantity: 2},
  ],
  mode: 'payment',
});
*/






const placeOrder = asyncHandler(async (req, res) => {
  console.log(req.body);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{

      price_data:{
        currency:'inr',
        product_data:{
          name: req.body.productTitle,
        },
        unit_amount: req.body.price*101
      },
      quantity:1


    }],
    success_url: `${process.env.SERVER_URL}/`,
    cancel_url: `${process.env.SERVER_URL}/product/${req.body.productID}`
  })

  console.log(session.url)

  res.status(200).json({ url: session.url })



});


const getCards = asyncHandler(async (req, res) => {
  const products = await Product.getProductCards(
    undefined,
    req.query?.catId,
    req.query?.subCatId
  );
  products.forEach((item) => {
    const buffer = item.images[0];
    const base64Image = buffer.toString("base64");
    item.images = `data:image/jpeg;base64,${base64Image}`;
  });

  console.log(product[0]);

  res.status(200).json(products);
});



const renderBuyStatus = asyncHandler(async(req,res)=>{

  res.render('buyStatus')

})


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
  getCards,
  renderBuyStatus
};

const getQueryStateProduct = async (matchConditions, sortConditions) => {
  const products = await Product.aggregate([
    {
      $match: {
        $and: matchConditions,
      },
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

        createdAt: 1,
        userID: 1,
      },
    },
  ]);

  return products;
};

// const func = async () => {
//     console.log(
//         geolib.getDistance({latitude:9.9380519,longitude:76.321859},{latitude:29.1229234,longitude:79.6868848})
//     )
// }

// func()
