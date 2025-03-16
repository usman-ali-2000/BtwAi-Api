require('./conn');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
// const uploadLogin = require('./Login');
const Farm = require('./Farm');
const Variety = require('./Variety');
const Plot = require('./Plot');
const Category = require('./Category');
const Product = require('./Product');
const ProductCreate = require('./ProductCreate');
const Irrigationsr = require('./Irrigationsr');
const Job = require('./Job');
const DailyEntry = require('./DailyEntry');
const Vehicle = require('./Vehicle');
const FinancialSeason = require('./FinancialSeason');
const Fuel = require('./Fuel');
const AdminRegister = require('./AdminRegister');
const cors = require('cors');
const { Cart } = require('./Cart');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Task = require('./Task');
const Asset = require('./Asset');
const Banner = require('./Banner');
const ScreenShot = require('./ScreenShot');
const TransHistory = require('./TransHistory');
const Notification = require('./Notification');
const Withdraw = require('./Withdraw');
const Calculation = require('./Calculation');
const Stock = require('./StockSchema');
const Campaign = require('./Campaign');

const PORT = process.env.PORT || 8000;

app.use(express.json());
const corsOptions = {
  origin: '*', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies if needed
};

app.use(cors(corsOptions));

const generateUniqueId = async () => {
  try {
    const date = new Date();
    const dateString = date.toISOString().slice(2, 10).replace(/-/g, ''); // Format date to YYMMDD

    let count = 1; // Start with count 1
    let uniqueId = `${dateString}${count}`; // Initial generated ID

    // Use a loop to check if the generatedId already exists
    while (await AdminRegister.findOne({ generatedId: uniqueId })) {
      count++; // Increment the count
      uniqueId = `${dateString}${count}`; // Generate a new ID with the updated count
    }

    return uniqueId;

  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw error;
  }
};


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 9000); // 6-digit OTP
};


// Create a POST route to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // const existingUser = await AdminRegister.findOne({ email });
  //   if (existingUser) {
  //     return res.status(400).json({ msg: 'Email already exists' });
  //   }

  const otp = generateOTP(); // Generate a 6-digit OTP

  // Configure the Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {

      user: 'btw8834@gmail.com',
      pass: 'rokv myir vasw uqga',
    },
  });

  // Email options
  const mailOptions = {
    from: 'btw8834@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully', otp }); // You might want to store OTP in the database or session
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});

app.post('/send-email', async (req, res) => {
  const { email, text, subject } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Configure the Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'wingedxnetwork@gmail.com',
      pass: 'ypfr himv ztwm uvej',
    },
  });

  // Email options
  const mailOptions = {

    from: email,
    to: 'wingedxnetwork@gmail.com',
    subject: subject,
    text: text,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'email sent successfully' }); // You might want to store OTP in the database or session
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});


app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API...' })
})


app.post('/cart', async (req, res) => {
  try {
    const { email, status, items } = req.body; // Assume body contains email and items array

    // Create a new Cart entry
    const newCart = new Cart({
      email,
      status,
      items
    });

    // Save the cart to the database
    await newCart.save();

    res.status(201).json({ success: true, message: 'Cart created successfully', cart: newCart });
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ success: false, message: 'Error creating cart', error });
  }
});

app.patch('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;  // Get cart ID from URL
    const { status, items } = req.body;  // Get new status and items from the body

    // Find the cart by ID and update the fields
    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      { $set: { status, items } },  // Update status and items
      { new: true, runValidators: true }  // Ensure the updated document is returned and validators are run
    );

    // Check if the cart was found and updated
    if (!updatedCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Error updating cart', error });
  }
});


app.get('/cart', async (req, res) => {
  try {
    // Find the cart for the user by email
    const cart = await Cart.find();

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Error fetching cart', error });
  }
});


app.get('/banner', async (req, res) => {
  try {
    const banners = await Banner.find(); // Sort by createdAt in descending order
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

app.post('/banner', async (req, res) => {
  const { banner } = req.body;

  try {
    const newBanner = new Banner({
      banner
    });

    const saveBanner = await newBanner.save();
    res.status(201).json({ message: 'Post created successfully', post: saveBanner });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});


app.delete("/banner/:id", async (req, res) => {
  try {

    const bannerDel = await Banner.findByIdAndDelete(req.params.id);

    if (!bannerDel) {
      return res.status(404).send("Data not found");
    }

    if (!req.params.id) {
      res.status(201).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
})

app.get('/asset', async (req, res) => {
  try {
    const assets = await Asset.find(); // Sort by createdAt in descending order
    res.status(200).json({ assets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});


app.post('/asset', async (req, res) => {
  const { heading, appIcon, ad, facebook, whatsapp, instagram, twitter, tiktok, youtube, telegram, discord, version, telegramSupport } = req.body;

  try {
    const newPost = new Asset({
      heading,
      appIcon,
      ad,
      facebook,
      whatsapp,
      instagram,
      twitter,
      tiktok,
      youtube,
      telegram,
      discord,
      version,
      telegramSupport,
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: savedPost });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// app.get('/task/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Fetch all tasks
//     const tasks = await Task.find();

//     // Separate tasks into viewed and not viewed based on whether the user's ID is in the views array
//     const viewedTasks = tasks.filter(task => task.views.includes(userId));
//     const notViewedTasks = tasks.filter(task => !task.views.includes(userId));

//     res.status(200).json({
//       viewedTasks,
//       notViewedTasks,
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve tasks' });
//   }
// });

app.delete("/asset/:id", async (req, res) => {
  try {

    const userTask = await Asset.findByIdAndDelete(req.params.id);

    if (!userTask) {
      return res.status(404).send("Data not found");
    }

    if (!req.params.id) {
      res.status(201).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
})


app.patch('/asset/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedAsset = await Asset.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.status(200).json({ message: 'Asset updated successfully', asset: updatedAsset });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update asset' });
  }
});



// GET: Retrieve all tasks in reverse order
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // Sort by createdAt in descending order
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});


app.post('/calculation', async (req, res) => {
  const { soldNfuc, usdt, withdrawUsdt } = req.body;

  try {
    const newCalc = new Calculation({
      soldNfuc,
      usdt,
      withdrawUsdt,
    });

    const savedCalc = await newCalc.save();
    res.status(201).json({ message: 'Calculation created successfully', post: savedCalc });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Calculation' });
  }
});
app.get('/calculation', async (req, res) => {
  try {
    const get = await Calculation.find();

    res.status(200).json(get);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Calculation' });
  }
});

app.post('/task', async (req, res) => {
  const { link, heading, subHeading } = req.body;

  try {
    const newPost = new Task({
      heading,
      subHeading,
      link,
      views: [],
      createdAt: Date.now(),
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: savedPost });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.get('/task/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    const viewedTasks = tasks.filter(task => task.views.includes(userId));
    const notViewedTasks = tasks.filter(task => !task.views.includes(userId));

    res.status(200).json({
      viewedTasks,
      notViewedTasks,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

app.delete("/task/:id", async (req, res) => {
  try {

    const userTask = await Task.findByIdAndDelete(req.params.id);

    if (!userTask) {
      return res.status(404).send("Data not found");
    }

    if (!req.params.id) {
      res.status(201).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
})

app.put('/task/:postId', async (req, res) => {
  const session = await mongoose.startSession(); // Start a session
  try {
    session.startTransaction(); // Start a transaction

    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      await session.abortTransaction(); // Abort transaction on invalid data
      return res.status(400).json({ error: 'Post ID and User ID are required' });
    }

    // Update Task to add userId to views array
    const updatedPost = await Task.findByIdAndUpdate(
      postId,
      { $addToSet: { views: userId } }, // Add userId only if it doesn't exist
      { new: true, session } // Use the session
    );

    if (!updatedPost) {
      await session.abortTransaction(); // Abort if post not found
      return res.status(404).json({ error: 'Post not found' });
    }

    const taskDollar = parseFloat((1 / 30).toFixed(6));

    // Increment `usdt` for the user
    const updateTaskUsdt = await AdminRegister.findByIdAndUpdate(
      userId,
      { $inc: { usdtTask: taskDollar } },
      { new: true, session }
    );

    if (!updateTaskUsdt) {
      await session.abortTransaction(); // Abort if user update fails
      return res.status(400).json({ error: 'Failed to update user task rewards' });
    }

    const calcId = "67c57330b46b935d98591bab";

    // Increment `usdt` in Calculation
    const updateCalculation = await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { usdt: taskDollar } },
      { new: true, session }
    );

    if (!updateCalculation) {
      await session.abortTransaction(); // Abort if calculation update fails
      return res.status(400).json({ error: 'Failed to update calculation' });
    }

    await session.commitTransaction(); // Commit transaction if all updates succeed

    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Error updating post:', error);
    await session.abortTransaction(); // Abort on any error
    res.status(500).json({ error: 'Failed to update post' });
  } finally {
    session.endSession(); // End session in all cases
  }
});


app.get('/register/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = await AdminRegister.findById(id);
    res.json(adminId);
  } catch (error) {
    console.error('Error fetching farm', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/user-register/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = await AdminRegister.findOne({ generatedId: userId });
    res.json(adminId);
  } catch (error) {
    console.error('Error fetching farm', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete("/register/:id", async (req, res) => {
  try {

    const registerDel = await AdminRegister.findByIdAndDelete(req.params.id);

    if (!registerDel) {
      return res.status(404).send("Data not found");
    }

    if (!req.params.id) {
      res.status(201).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
})


//update Register
app.patch("/register-claim-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { claimEndTime } = req.body;


    const updatedUser = await AdminRegister.findByIdAndUpdate(
      id,
      { claimEndTime: claimEndTime },
      {
        new: true,
      });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(updatedUser);
  } catch (e) {
    res.status(400).send({ message: "Error updating user", error: e });
  }
});

//update Register
app.patch("/register/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let updateData = req.body;

    if (updateData.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      updateData.password = hashedPassword;
    }

    const updatedUser = await AdminRegister.findOneAndUpdate({ email }, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(updatedUser);
  } catch (e) {
    res.status(400).send({ message: "Error updating user", error: e });
  }
});

app.patch('/register/:id/send-usdt', async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const _id = req.params.id;
    const { amount, ssId } = req.body;

    // Validate input
    const find = await ScreenShot.findById(ssId).session(session);
    if (find.scam || find.verify) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Cannot perform action' });
    }

    if (typeof amount !== 'number') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Amount must be a number' });
    }

    // Update admin's USDT
    const result = await AdminRegister.findByIdAndUpdate(
      _id,
      { $inc: { usdt: amount } },
      { new: true, session }
    );

    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Admin with the given ID not found' });
    }

    // Update calculation data
    const calcId = '67c57330b46b935d98591bab';
    const updateCalc = await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { usdt: amount } },
      { new: true, session }
    );

    // Update screenshot verification
    const updateScreenshot = await ScreenShot.findByIdAndUpdate(
      ssId,
      { verify: true },
      { new: true, session }
    );

    if (!updateScreenshot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Screenshot with the given ID not found' });
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'USDT added successfully',
      updatedAdmin: result,
      updatedCalculation: updateCalc,
      updatedScreenshot: updateScreenshot,
    });
  } catch (error) {
    // Rollback transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error adding USDT:', error);
    res.status(500).json({ error: 'An error occurred while adding USDT' });
  }
});



// PATCH route to add coins to an admin's existing coin balance
app.patch('/register/:id/add-coins', async (req, res) => {

  const _id = req.params.id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userData = await AdminRegister.findById(_id).session(session);

    if (!userData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Admin with the given ID not found' });
    }

    let referDayInc = 0;
    let percentValue = 2;
    if (userData.referDays <= 7) {
      referDayInc = 1;
      percentValue = 4;
    }

    let additionalCoins = (userData.planusdt * percentValue) / 100;

    const result = await AdminRegister.findByIdAndUpdate(
      _id,
      { $inc: { usdt: additionalCoins, referDays: referDayInc } },
      { new: true, session }
    );

    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Failed to update user' });
    }

    const calcId = "67c57330b46b935d98591bab";

    const calcUpdate = await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { usdt: additionalCoins } },
      { session }
    );

    if (!calcUpdate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ error: 'Failed to update calculation' });
    }

    // Commit transaction after both updates succeed
    await session.commitTransaction();
    res.json({ message: 'Coins added successfully', updatedAdmin: result });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding coins:", error);
    res.status(500).json({ error: 'An error occurred while adding coins' });
  } finally {
    session.endSession();
  }
});


app.patch('/register/:userId/minus-usdt', async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { userId } = req.params;
    const { amount } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid amount. Must be greater than 0.' });
    }

    // Find user by ID
    const user = await AdminRegister.findOne({ generatedId: userId }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    let total = user.usdt + user.usdtRefer;

    if (amount > total) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient USDT balance.' });
    }

    // Deduct coins from sender
    let senderUpdate;
    if (amount <= user.usdtRefer) {
      senderUpdate = await AdminRegister.findOneAndUpdate(
        { generatedId: userId },
        { $inc: { usdtRefer: -amount } },
        { new: true, session }
      );
    } else {
      const amt = amount - user.usdtRefer; // Amount to deduct from `usdtRefer`
      senderUpdate = await AdminRegister.findOneAndUpdate(
        { generatedId: userId },
        { $set: { usdtRefer: 0 }, $inc: { usdt: -amt } }, // Set `usdt` to 0 and deduct the remainder from `usdtRefer`
        { new: true, session }
      );
    }

    if (!senderUpdate) {
      throw new Error('Error updating sender balance.');
    }

    // Update Calculation document
    const calcId = '67c57330b46b935d98591bab';
    const updateCalc = await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { withdrawUsdt: amount, usdt: -amount } },
      { new: true, session }
    );

    if (!updateCalc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Calculation record not found.' });
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'USDT deducted successfully.',
      balance: senderUpdate.usdt,
      usdtRefer: senderUpdate.usdtRefer,
    });
  } catch (error) {
    // Rollback transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error deducting USDT:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});


app.patch('/register/:id/add-nfuc', async (req, res) => {
  const _id = req.params.id;
  const { additionalCoins, accType } = req.body;

  // Validate that additionalCoins is a number
  if (typeof additionalCoins !== 'number') {
    return res.status(400).json({ error: 'additionalCoins must be a number' });
  }

  try {
    // Build the update object dynamically
    const updateData = {
      $inc: { nfuc: additionalCoins }, // Increment the nfuc field
    };

    // If accType is provided, add it to the update object
    if (accType) {
      updateData.$set = { accType: accType }; // Set the accType if provided
    }

    // Perform the update
    const result = await AdminRegister.findByIdAndUpdate(
      _id,
      updateData,
      { new: true } // Return the updated document
    );

    if (result) {
      res.json({ message: 'Coins added successfully', updatedAdmin: result });
    } else {
      res.status(404).json({ error: 'Admin with the given ID not found' });
    }
  } catch (error) {
    console.error("Error adding coins:", error);
    res.status(500).json({ error: 'An error occurred while adding coins' });
  }
});


app.patch('/attempts/:id', async (req, res) => {

  const _id = req.params.id;
  const { attempt, date } = req.body;

  if (typeof attempt !== 'number') {
    return res.status(400).json({ error: 'additionalCoins must be a number' });
  }

  try {
    const result = await AdminRegister.findByIdAndUpdate(
      _id,
      { attempts: attempt, date: date },
      { new: true } // Return the updated document
    );

    if (result) {
      res.json({ message: 'Coins added successfully', updatedAdmin: result });
    } else {
      res.status(404).json({ error: 'Admin with the given ID not found' });
    }
  } catch (error) {
    console.error("Error adding coins:", error);
    res.status(500).json({ error: 'An error occurred while adding coins' });
  }
});

// PATCH route to add coins to an referCoins existing coin balance
app.patch('/register/generated/:generatedId/refer-coins', async (req, res) => {
  const { generatedId } = req.params;
  const { referCoins } = req.body;

  if (typeof referCoins !== 'number') {
    return res.status(400).json({ error: 'referCoins must be a number' });
  }

  try {
    const result = await AdminRegister.findOneAndUpdate(
      { generatedId: generatedId }, // Find by custom `generatedId` field
      { $inc: { referCoin: referCoins } }, // Increment the referCoin field
      { new: true } // Return the updated document
    );

    if (result) {
      res.json({ message: 'Refer coins added successfully', updatedAdmin: result });
    } else {
      res.status(404).json({ error: 'Admin with the given generated ID not found' });
    }
  } catch (error) {
    console.error("Error adding refer coins:", error);
    res.status(500).json({ error: 'An error occurred while adding refer coins' });
  }
});


// PATCH route to add coins to an referCoins existing coin balance
app.patch('/register/generated/:generatedId/refer-nfuc', async (req, res) => {

  const { generatedId } = req.params;
  const { nfucRefer } = req.body;

  if (typeof nfucRefer !== 'number') {
    return res.status(400).json({ error: 'referCoins must be a number' });
  }

  try {
    const result = await AdminRegister.findOneAndUpdate(
      { generatedId: generatedId }, // Find by custom `generatedId` field
      { $inc: { nfucRefer: nfucRefer } }, // Increment the referCoin field
      { new: true } // Return the updated document
    );


    if (result) {
      res.json({ message: 'Refer coins added successfully', updatedAdmin: result });
    } else {
      res.status(404).json({ error: 'Admin with the given generated ID not found' });
    }
  } catch (error) {
    console.error("Error adding refer coins:", error);
    res.status(500).json({ error: 'An error occurred while adding refer coins' });
  }
});


app.patch('/sevenDayReward/:id', async (req, res) => {
  const session = await mongoose.startSession();  // Start a session
  try {
    session.startTransaction();  // Start a transaction

    const { id } = req.params;
    const user = await AdminRegister.findById(id).session(session);  // Fetch user in session

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'User not found' });
    }

    const currentDate = new Date();
    const lastClaimDate = user.lastClaimDate ? new Date(user.lastClaimDate) : user.registrationDate;

    // Check if 1 day has passed since last reward
    const oneDayInMillis = 24 * 60 * 60 * 1000;
    if (currentDate - lastClaimDate < oneDayInMillis && user.rewardDays < 7) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'You can claim the reward only once a day' });
    }

    if (user.rewardDays <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'No more rewards left to claim' });
    }

    const claimamt = parseFloat((4 / 7).toFixed(6));

    const updateRegister = await AdminRegister.findByIdAndUpdate(
      id,
      {
        $inc: { usdt: claimamt, rewardDays: -1 },  // Decrement correctly
        $set: { lastClaimDate: currentDate }  // Update lastClaimDate
      },
      { new: true, session }  // Ensure it updates within session
    );

    if (!updateRegister) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Failed to update reward' });
    }

    const calcId = '67c57330b46b935d98591bab';
    await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { usdt: claimamt } },
      { session }
    );

    await session.commitTransaction();  // Commit the transaction

    res.json({
      message: 'Reward claimed successfully',
      updateDailyReward: updateRegister
    });
  } catch (e) {
    console.error("Error adding usdt:", e);
    await session.abortTransaction();  // Rollback changes on error
    res.status(500).json({ error: 'An error occurred while adding usdt' });
  } finally {
    session.endSession();  // End the session
  }
});

app.patch('/register/:id/first-claim', async (req, res) => {
  try {
    const id = req.params.id;

    const updateFirstClaim = await AdminRegister.findByIdAndUpdate(
      id,
      { $set: { firstClaim: true }, $inc: { usdt: 2 } },
      { new: true }
    );

    if (!updateFirstClaim) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'Updated First Claim.', data: updateFirstClaim });

  } catch (e) {
    console.error('Error updating first claim:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.patch('/register/updateAll', async (req, res) => {
  try {
    const updateAll = await AdminRegister.updateMany(
      { rewardDays: 0 },
      { $set: { rewardDays: 7 }, $inc: { usdt: 1 } }
    );

    if (updateAll.modifiedCount > 0) {
      return res.status(200).json({ message: 'Updated all successfully.' });
    } else {
      return res.status(400).json({ error: 'No records found to update.' });
    }
  } catch (e) {
    console.error('Error updating all:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.patch('/register/dollarToNfuc/:id', async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const { planusdt, amount, accType, referId, level } = req.body;

    if (!planusdt || !amount || !accType || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0 || planusdt <= 0) {
      return res.status(400).json({ error: 'Invalid amount or coin value' });
    }

    // Find the user by ID
    const userData = await AdminRegister.findById(id).session(session);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const total = userData.usdt + userData.usdtRefer;

    if (amount > total) {
      return res.status(400).json({ error: 'Insufficient USDT balance' });
    }

    let newLevel;

    if (userData.level < level) {
      newLevel = level;
    } else {
      newLevel = userData.level;
    }

    let updatedUser;

    let newPlan = planusdt;
    if (level === 6) newPlan = planusdt + 100;
    else if (level === 7) newPlan = planusdt + 200;
    else if (level === 8) newPlan = planusdt + 300;
    else if (level === 9) newPlan = planusdt + 400;
    else if (level === 10) newPlan = planusdt + 500;

    if (amount <= userData.usdt) {
      updatedUser = await AdminRegister.findByIdAndUpdate(
        id,
        {
          $inc: { planusdt: newPlan, usdt: -amount },
          level: newLevel,
          accType: accType
        },
        { new: true, session }
      );
    } else {
      const remaining = amount - userData.usdt;
      updatedUser = await AdminRegister.findByIdAndUpdate(
        id,
        {
          $inc: { planusdt: newPlan, usdt: -userData.usdt, usdtRefer: -remaining },
          level: newLevel,
          accType: accType
        },

        { new: true, session }
      );
    }

    let incrementValue = 0;

    if (referId && referId.trim() !== '') {
      const findLevel = await AdminRegister.findOne({ generatedId: referId }).session(session);
      let level = findLevel?.level || 0;
      let percent = 20;
      incrementValue = (newPlan * percent) / 100;
    }

    if (incrementValue === null) {
      throw new Error('Invalid account type');
    }

    const calcId = "67c57330b46b935d98591bab";

    if (referId && referId.trim() !== '') {
      await AdminRegister.findOneAndUpdate(
        { generatedId: referId },
        { $inc: { usdtRefer: incrementValue, earnFriend: incrementValue } },
        { session }
      );

      await Calculation.findByIdAndUpdate(
        calcId,
        { $inc: { usdt: incrementValue } },
        { session }
      );
    }

    await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { soldNfuc: newPlan } },
      { session }
    );

    await session.commitTransaction();
    return res.json({ updatedUser });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating user data:', error);
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

app.get('/transhistory/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Query the database to find transactions where the id matches either the sender or receiver
    const transactions = await TransHistory.find({
      $or: [{ receiver: id }, { sender: id }],
    }).sort({ _id: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found for the given ID' });
    }

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.patch('/transfer-nfuc', async (req, res) => {
  const { senderId, receiverId, amount } = req.body;

  // Validate input
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  try {
    const session = await AdminRegister.startSession();
    session.startTransaction();

    try {
      // Fetch sender's coins
      const checkCoins = await AdminRegister.findOne({ generatedId: senderId }).session(session);

      if (!checkCoins) {
        throw new Error('Sender with the given ID not found');
      }

      const total = checkCoins.nfuc + checkCoins.nfucRefer;

      if (amount > total) {
        throw new Error('Insufficient balance');
      }

      // Deduct coins from sender
      let senderUpdate;
      if (amount <= checkCoins.nfuc) {
        senderUpdate = await AdminRegister.findOneAndUpdate(
          { generatedId: senderId },
          { $inc: { nfuc: -amount } },
          { new: true, session }
        );
      } else if (amount <= total) {
        const amt = amount - checkCoins.nfuc;
        senderUpdate = await AdminRegister.findOneAndUpdate(
          { generatedId: senderId },
          { $inc: { nfuc: -checkCoins.nfuc, nfucRefer: -amt } },
          { new: true, session }
        );
      }

      if (!senderUpdate) {
        throw new Error('Error updating sender balance');
      }

      // Add coins to receiver
      const receiverUpdate = await AdminRegister.findOneAndUpdate(
        { generatedId: receiverId },
        { $inc: { nfuc: amount } },
        { new: true, session }
      );

      if (!receiverUpdate) {
        throw new Error('Receiver with the given ID not found');
      }

      // Log the transaction
      const newTrans = new TransHistory({
        sender: senderId,
        receiver: receiverId,
        nfuc: amount,
      });
      await newTrans.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.json({
        message: `Transfer successful between ${senderId} and ${receiverId}`,
        sender: senderUpdate,
        receiver: receiverUpdate,
      });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction failed:', transactionError);
      res.status(400).json({ error: transactionError.message });
    }
  } catch (error) {
    console.error('Error during transfer:', error);
    res.status(500).json({ error: 'An error occurred during the transfer process' });
  }
});



app.post("/admin-login", async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (email === 'adminwingedx@gmail.com' && password === 'nfuc@5673#') {
      res.status(200).json({ success: 'login successfull' });
    } else {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(400).send(e);

  }
});

app.post("/register", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Received request body:", req.body);

    const { email, name, userId, password, location, deviceId, acceptConditions } = req.body;

    if (!name || !email || !password || !acceptConditions) {
      return res.status(400).json({ msg: "All fields are mandatory" });
    }

    // Check if device is already registered
    // const deviceExist = await AdminRegister.findOne({ deviceId }).session(session);
    // if (deviceExist) {
    //   return res.status(402).json({ msg: "Device already registered" });
    // }

    // Check if email already exists
    const existingUser = await AdminRegister.findOne({ email }).session(session);
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const generatedId = await generateUniqueId();

    // Hash the password securely
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({ msg: "Error hashing password" });
    }

    const user = new AdminRegister({
      name,
      email,
      generatedId: generatedId.toString(),
      userId,
      password: hashedPassword,
      location,
      deviceId,
      acceptConditions,
    });

    await user.save({ session });

    await AdminRegister.updateOne(
      { email },
      { $set: { rewardDays: 7 } },
      { session }
    );

    await session.commitTransaction();
    
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });

    console.log("User registered successfully:", user);
  } catch (e) {
    await session.abortTransaction();
    console.error("Error during registration:", e);
    res.status(500).json({ msg: "Server error. Please try again later." });
  } finally {
    session.endSession(); // Always close session
  }
});


app.post("/login", async (req, res) => {

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await AdminRegister.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email, userId: user.userId, generatedId: user.generatedId } });
  } catch (e) {
    res.status(400).send(e);
  }
});


app.delete("/login/:id", async (req, res) => {
  try {

    const user = await uploadLogin.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).send("Data not found");
    }

    if (!req.params.id) {
      res.status(201).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
})


app.patch("/login/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateCategory = await uploadLogin.findByIdAndUpdate(_id, req.body, {
      new: true
    });
    res.send(updateCategory);
  }
  catch (e) {
    res.status(400).send(e);
  }
});


app.get('/register', async (req, res) => {
  try {
    const admin = await AdminRegister.find();
    res.json(admin);
  } catch (error) {
    console.error('Error fetching farms', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET all ScreenShots
app.get('/screenshot', async (req, res) => {
  try {
    const screenshot = await ScreenShot.find().sort({ _id: -1 });
    res.json(screenshot);
  } catch (error) {
    console.error('Error fetching screenshot', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST create screenshot
app.post('/screenshot', async (req, res) => {
  try {
    const { image1, payerId, referId, price, verify, scam } = req.body;

    if (!image1) {
      return res.status(400).json({ error: 'screenshot and image URL are required.' });
    }

    const newScreenShot = new ScreenShot({ image1, payerId, referId, price, verify, scam });
    await newScreenShot.save();
    res.status(201).json(newScreenShot);
  } catch (error) {
    console.error('Error creating screenshot:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/screenshot/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const findScreenshot = await ScreenShot.findById(id);
    if (!findScreenshot) {
      res.status(404).json({ message: 'screenshot not found' });
    } else {
      res.json(findScreenshot);
    }
  } catch (error) {
    console.error('Error finding screenshot', error);
    res.status(500).send('Internal Server Error');
  }
});


// DELETE screenshot

app.delete('/screenshot/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedScreenshot = await ScreenShot.findByIdAndDelete(id);
    if (!deletedScreenshot) {
      res.status(404).json({ message: 'screenshot not found' });
    } else {
      res.json({ message: 'screenshot deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting screenshot', error);
    res.status(500).send('Internal Server Error');
  }
});

app.patch("/screenshot/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    let find = await ScreenShot.findById(_id);

    if (!find) {
      return res.status(404).send({ error: "Screenshot not found" });
    }

    if (find.scam) {
      return res.status(402).send({ error: "Cannot perform action" });
    }
    const updatescreenshot = await ScreenShot.findByIdAndUpdate(_id, req.body, {
      new: true
    });
    res.send(updatescreenshot);
  }
  catch (e) {
    res.status(400).send(e);
  }
});

app.get('/withdraw', async (req, res) => {
  try {
    const withdraw = await Withdraw.find().sort({ _id: -1 });
    res.json(withdraw);
  } catch (error) {
    console.error('Error fetching withdraw', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/transhistory', async (req, res) => {
  try {
    const { sender, receiver, usdt, address, account, blockchain } = req.body;
    const newTrans = new TransHistory({
      sender: sender,
      receiver: receiver,
      usdt: usdt,
      address: address,
      account: account,
      blockchain: blockchain,
    });
    await newTrans.save();
    res.status(201).json(newTrans);
  } catch (error) {
    console.error('Error creating withdraw:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.patch("/transhistory/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    const updatetranshistory = await TransHistory.findByIdAndUpdate(_id, req.body, {
      new: true
    });
    res.send(updatetranshistory);
  }
  catch (e) {
    res.status(400).send(e);
  }
});

app.delete('/transhistory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedtranshistory = await TransHistory.findByIdAndDelete(id);
    if (!deletedtranshistory) {
      res.status(404).json({ message: 'transhistory not found' });
    } else {
      res.json({ message: 'transhistory deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting transhistory', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/notification/:id', async (req, res) => {
  try {
    const { id } = req.params; // Destructure to improve readability
    const notifications = await Notification.find({ receiver: id }).sort({ _id: -1 });
    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ error: 'No notifications found for the given receiver ID' });
    }
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


app.post('/notification', async (req, res) => {
  try {
    const { receiver, heading, subHeading, path, seen } = req.body;

    const newNotification = new Notification({ receiver, heading, subHeading, path, seen });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.patch("/notification/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updatenotification = await Notification.findByIdAndUpdate(_id, req.body, {
      new: true
    });
    res.send(updatenotification);
  }
  catch (e) {
    res.status(400).send(e);
  }
});

app.delete('/notification/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) {
      res.status(404).json({ message: 'Notification not found' });
    } else {
      res.json({ message: 'Notification deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting Notification', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/stock/:id', async (req, res) => {
  try {
    const { id } = req.params; // Destructure to improve readability
    const stock = await Stock.findOne({ userId: id });
    if (!stock || stock.length === 0) {
      return res.status(404).json({ error: 'No stock found for the given id' });
    }
    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


app.post('/stock', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, stockNfuc, endDate } = req.body;

    // Check if required fields are provided
    if (!userId || !stockNfuc || !endDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userData = await AdminRegister.findById(userId).session(session);

    if (!userData) {
      throw new Error('User not found');
    }


    if (stockNfuc > userData.nfuc) {
      return res.status(400).json({ message: 'ٰinsufficient Nfuc' });
    }

    if (stockNfuc < 700 || userData.nfuc < 700) {
      return res.status(400).json({ message: 'NFUC less than 700' });
    }

    let regNfuc;
    regNfuc = stockNfuc - stockNfuc / 100;
    // Decrement user NFUC
    const updatedUser = await AdminRegister.findByIdAndUpdate(
      userId,
      { $inc: { nfuc: -regNfuc } },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user NFUC');
    }

    const newNfuc = stockNfuc - stockNfuc / 100;
    // Update stock calculation
    const calcId = '67c57330b46b935d98591bab';
    const updateCalc = await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { stock: stockNfuc, soldNfuc: -newNfuc } },
      { new: true, session }
    );

    if (!updateCalc) {
      throw new Error('Failed to update calculation');
    }

    // Create a new stock entry
    const newStock = new Stock({ userId, stockNfuc, endDate });
    await newStock.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Stock created successfully' });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating stock:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


app.patch("/stockClaim/:id", async (req, res) => {
  const session = await mongoose.startSession();  // Start a session
  session.startTransaction();

  try {
    const { id } = req.params;
    const { stockNfuc, days, lastClaim } = req.body;

    if (!id || !stockNfuc || days == undefined || !lastClaim) {
      res.status(404).send({ message: "All fields are mandatory" });
      return;
    }

    // Find and update the user in AdminRegister
    const updatedUser = await AdminRegister.findByIdAndUpdate(
      id,
      { $inc: { nfuc: stockNfuc / 100 } },
      { new: true, session }  // Use the session to ensure the operation is part of the transaction
    );

    if (!updatedUser) {
      throw new Error('Failed to update user NFUC');
    }

    const calcId = '67c57330b46b935d98591bab';  // Example static calculation ID
    const updateCalc = await Calculation.findByIdAndUpdate(
      calcId,
      { $inc: { soldNfuc: stockNfuc / 100 } },
      { new: true, session }
    );

    if (!updateCalc) {
      throw new Error('Failed to update calculation NFUC');
    }

    // Update stock document
    const updatestock = await Stock.findOneAndUpdate(
      { userId: id },
      { days: days, lastClaim: lastClaim },
      { new: true, session }
    );

    if (!updatestock) {
      throw new Error('Stock not found');
    }

    // If the days exceed 100, perform additional updates and delete stock
    if (days >= 100) {
      await AdminRegister.findByIdAndUpdate(
        id,
        { $inc: { nfuc: stockNfuc } },
        { new: true, session }
      );

      await Calculation.findByIdAndUpdate(
        calcId,
        { $inc: { soldNfuc: stockNfuc, stock: -stockNfuc } },
        { new: true, session }
      );

      await Stock.findOneAndDelete({ userId: id }, { session });

    }

    // Commit the transaction if all operations succeed
    await session.commitTransaction();
    res.status(200).send(updatestock);
  } catch (e) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    console.error(e);
    res.status(400).send({ error: e.message });
  } finally {
    // End the session
    session.endSession();
  }
});



app.patch("/stock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatestock = await Stock.findOneAndUpdate(
      { userId: id },
      req.body, {
      new: true
    });
    if (!updatestock) {
      return res.status(404).send({ error: "Stock not found" });
    }

    res.status(200).send(updatestock);
  }
  catch (e) {
    res.status(400).send(e);
  }
});

app.delete('/stock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStock = await Stock.findOneAndDelete({ userId: id });
    if (!deletedStock) {
      res.status(404).json({ message: 'Stock not found' });
    } else {
      res.json({ message: 'Stock deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting Stock', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/campaign', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/campaign', async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/campaign/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const campaign = await Campaign.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/campaign/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Campaign.findByIdAndDelete(id);
    res.status(204).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
