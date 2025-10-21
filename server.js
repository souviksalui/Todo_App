// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const multer = require('multer');

// dotenv.config();

// const app = express();
// app.use(cors()); // 
// app.use(express.json());
// // Make the 'public' folder accessible to the browser
// app.use(express.static(path.join(__dirname, 'public')));

// // Set up storage for uploaded files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// // Create the multer instance
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1024 * 1024 * 1 } // 1 MB file size limit
// });

// // mongoose.connect(process.env.MONGO_URI) //, { useNewUrlParser: true, useUnifiedTopology: true })
// //   .then(() => console.log('MongoDB connected...'))
// //   .catch(err => console.log(err));

// // --- ADD THIS LINE TO DEBUG ---
// console.log("Attempting to connect with URI:", process.env.MONGO_URI.trim());

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB Atlas connected successfully!');
//   })
//   .catch(err => {
//     console.error('❌ MongoDB connection error. Please make sure MongoDB is running and your .env file is configured correctly.');
//     console.error(err);
//     process.exit(1); // Exit the application if the database connection fails
//   });

// const taskSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   status: { type: String, enum: ['To Do', 'Doing', 'Done'], default: 'To Do' },
//   description: { type: String },
//   // createdAt: { type: Date, default: Date.now },
//   // updatedAt: { type: Date, default: Date.now },
//   tags: [String],
//   imageUrls: [String]
// }, {
//   timestamps: true
// }
// );

// // taskSchema.pre('save', function(next) {
// //   this.updatedAt = Date.now();
// //   next();
// //
// const Task = mongoose.model('Task', taskSchema);

// const logSchema = new mongoose.Schema({
//   taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
//   previousState: { type: Object },
//   newState: { type: Object },
//   changeType: { type: String, required: true }, // e.g., "Task Updated" or "Status Changed"
// }, {
//   timestamps: { createdAt: true, updatedAt: false } // We only care when the log was created
// });

// const Log = mongoose.model('Log', logSchema);

// app.get('/api/tasks', async (req, res) => {
//   // const tasks = await Task.find();
//   // res.json(tasks);
//   try {
//     const filter = {};
//     if (req.query.title) {
//       // Use regex for partial, case-insensitive title matching
//       filter.title = { $regex: req.query.title, $options: 'i' };
//     }
//     if (req.query.tags) {
//       // Find tasks that have all of the given tags
//       const tags = req.query.tags.split(',');
//       filter.tags = { $all: tags };
//     }
//     const tasks = await Task.find(filter);
//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching tasks', error });
//   }
// });

// app.get('/api/tasks/:id', async (req, res) => {
//   const task = await Task.findById(req.params.id);
//   res.json(task);
// });

// app.post('/api/tasks', upload.array('images', 5), async (req, res) => {
//   // const newTask = new Task({
//   //   title: req.body.title,
//   //   status: req.body.status,
//   //   tags: req.body.tags
//   try {
//     const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

//     const newTask = new Task({
//       title: req.body.title,
//       description: req.body.description,
//       tags: req.body.tags.split(',').map(tag => tag.trim()),
//       status: 'To Do',
//       imageUrls: imageUrls
//     });

//     const savedTask = await newTask.save();
//     res.status(201).json(savedTask);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating task', error });
//   }
 
//   // const savedTask = await newTask.save();
//   // res.json(savedTask);
// });


// // app.put('/api/tasks/:id', async (req, res) => {
// //   const updatedTask = await Task.findByIdAndUpdate(
// //     req.params.id,
// //     {
// //       title: req.body.title,
// //       status: req.body.status,
// //       tags: req.body.tags
// //     },
// //     { new: true }
// //   );
// //   res.json(updatedTask);
// // });

// // Update a task with logging

// app.put('/api/tasks/:id', async (req, res) => {
//   try {
//     // 1. Find the task *before* updating it
//     const previousTask = await Task.findById(req.params.id);
//     if (!previousTask) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // 2. Perform the update
//     const updatedTask = await Task.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true } // {new: true} returns the document after update
//     );

//     // 3. Create a log entry
//     const log = new Log({
//       taskId: req.params.id,
//       previousState: {
//         title: previousTask.title,
//         status: previousTask.status,
//         tags: previousTask.tags,
//       },
//       newState: {
//         title: updatedTask.title,
//         status: updatedTask.status,
//         tags: updatedTask.tags,
//       },
//       // Determine if it was a status change or a general edit
//       changeType: previousTask.status !== updatedTask.status ? 'Status Changed' : 'Task Updated',
//     });
//     await log.save();

//     // 4. Send the updated task back to the frontend
//     res.json(updatedTask);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating task', error });
//   }
// });

// // Delete a task
// app.delete('/api/tasks/:id', async (req, res) => {
//   await Task.findByIdAndDelete(req.params.id);
//   res.json({ message: 'Task deleted successfully' });
// });

// // Get all logs for a specific task
// app.get('/api/tasks/:id/logs', async (req, res) => {
//   try {
//     const logs = await Log.find({ taskId: req.params.id }).sort({ createdAt: -1 });
//     res.json(logs);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching logs', error });
//   }
// });


// // --- Start Server ---
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

  // app.get('/api/logs', ...) and app.get('/api/tasks/:id/logs', ...) twice. 
  // In Express, only the first definition for a given route will be used.
// Make sure to remove or comment out the duplicate route definitions.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); // Require the File System module at the top of your file
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// // Email transporter setup

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// // Verify the transporter configuration
// transporter.verify(function(error, success) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('✅ Email transporter is ready to send emails');
//     }
// });

// Create a test transporter using Ethereal
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a test account. ' + err.message);
        return process.exit(1);
    }
    console.log('✅ Ethereal test account created!');
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass,
        },
    });
});

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Static Folder for Uploads ---
// This makes the 'public' folder accessible from the browser to display images
app.use(express.static(path.join(__dirname, 'public')));

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 1 } // 1MB file size limit
});

// --- Helper Function: Generate PDF from Logs ---
// (Add this function somewhere in server.js)
async function generateLogPdf(logs) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);

        // --- PDF Content ---
        doc.fontSize(18).text('Task Log Export', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(10).text(`Export generated on: ${new Date().toLocaleString()}`, { align: 'left' });
        doc.moveDown();

        if (logs.length === 0) {
            doc.fontSize(12).text('No logs found for the selected criteria.');
        } else {
            logs.forEach(log => {
                const taskTitle = log.taskId ? log.taskId.title : (log.previousState.title || 'Unknown Task');
                
                doc.fontSize(14).fillColor('black').text(`Task: ${taskTitle}`, { underline: true });
                doc.fontSize(10).fillColor('gray').text(`Log Time: ${new Date(log.createdAt).toLocaleString()}`);
                doc.fontSize(10).fillColor('gray').text(`Change: ${log.changeType}`);
                doc.moveDown(0.5);

                doc.fontSize(11).fillColor('black').text('Previous State:');
                doc.fontSize(10).fillColor('black').list([
                    `Title: ${log.previousState.title}`,
                    `Status: ${log.previousState.status}`
                ]);

                doc.fontSize(11).fillColor('black').text('New State:');
                doc.fontSize(10).fillColor('black').list([
                    `Title: ${log.newState.title}`,
                    `Status: ${log.newState.status}`
                ]);
                
                doc.moveDown(2);
            });
        }
        
        doc.end();
    });
}

// --- Helper Function: Get Datetime for Filename ---
// (To match your requested format)
function datetimenow() {
    const d = new Date();
    return `${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}_${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}${d.getSeconds().toString().padStart(2, '0')}`;
}

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI.trim())
  .then(() => console.log('✅ MongoDB Atlas connected successfully!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- Mongoose Schemas & Models ---

// --- User Schema ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Updated Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['To Do', 'Doing', 'Done'], default: 'To Do' },
  tags: [String],
  imageUrls: [String],
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  taskIdentifier: { type: String }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

// Log Schema (from previous implementation)
const logSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  previousState: { type: Object },
  newState: { type: Object },
  changeType: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const Log = mongoose.model('Log', logSchema);

// --- API Routes ---

// in server.js, before the "Start Server" section

// --- USER API ROUTES ---

// 1. Register a new user (and send OTP)
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        const newUser = new User({ name, email, phone, otp, otpExpires });
        await newUser.save();

        // // Send OTP email
        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: email,
        //     subject: 'Your OTP for Task Board Verification',
        //     text: `Welcome to Task Board! Your One-Time Password is: ${otp}`
        // });

        // Add this console log instead
        console.log(`✅ OTP for ${email}: ${otp}`);

        if (!transporter) {
           return res.status(500).json({ message: "Email service is not ready yet. Try again." });
        }

        // Send the email using the Ethereal transporter
        const info = await transporter.sendMail({
            from: '"Task Board Admin" <admin@taskboard.com>', // Can be anything
            to: email,
            subject: 'Your OTP for Task Board Verification',
            text: `Welcome to Task Board! Your One-Time Password is: ${otp}`
        });

        console.log("Message sent: %s", info.messageId);
        // This is the important part!
        console.log("✅ Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.status(201).json({ message: 'User registered. Please check your email for the OTP.', userId: newUser._id });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error });
    }
});

// 2. Verify OTP
app.post('/api/users/verify', async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        user.isVerified = true;
        user.otp = undefined; // Clear OTP after verification
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'User verified successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server error during verification.', error });
    }
});

// 3. Get all verified users (for dropdowns and lists)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({ isVerified: true }).select('name email');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users.', error });
    }
});

// GET Tasks (with filtering)
app.get('/api/tasks', async (req, res) => {
  try {
    const filter = {};
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: 'i' };
    }
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      if (tags.length > 0) filter.tags = { $all: tags };
    }
    const tasks = await Task.find(filter).sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.json(task);
});

// POST a new Task (with image uploads)
app.post('/api/tasks', upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];
    
    // Parse the assignedUsers array sent from FormData
    const assignedUsers = req.body.assignedUsers ? JSON.parse(req.body.assignedUsers) : [];

    // --- TASK IDENTIFIER LOGIC ---
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // e.g., "25"
    // Determine financial year end (e.g., TA/25-26)
    const nextYear = (now.getMonth() + 1 > 3) 
                   ? (parseInt(year) + 1).toString() 
                   : year;
    const taskTitle = req.body.title;
    const taskIdentifier = `TA/${year}-${nextYear}/${taskTitle.replace(/ /g, '_')}`;

    const newTask = new Task({
      title: req.body.title,
      description: req.body.description,
      status: 'To Do',
      tags: tags,
      imageUrls: imageUrls,
      assignedUsers: assignedUsers, // Add to new task
      taskIdentifier: taskIdentifier // Save the new ID
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("❌ Error creating task:", error);
    res.status(500).json({ message: 'Error creating task', error });
  }
});

// PUT (Update) a Task
// app.put('/api/tasks/:id', async (req, res) => {
//   try {
//     const previousTask = await Task.findById(req.params.id);
//     if (!previousTask) return res.status(404).json({ message: 'Task not found' });
    
//     const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     const log = new Log({
//       taskId: req.params.id,
//       previousState: { title: previousTask.title, status: previousTask.status, tags: previousTask.tags, description: previousTask.description },
//       newState: { title: updatedTask.title, status: updatedTask.status, tags: updatedTask.tags, description: updatedTask.description },
//       changeType: previousTask.status !== updatedTask.status ? 'Status Changed' : 'Task Updated',
//     });
//     await log.save();

//     res.json(updatedTask);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating task', error });
//   }
// });

// PUT (Update) a Task (now with file upload support)
app.put('/api/tasks/:id', upload.array('images', 5), async (req, res) => {
  try {
    const previousTask = await Task.findById(req.params.id);
    if (!previousTask) return res.status(404).json({ message: 'Task not found' });

    // Handle incoming text fields
    const updatedFields = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      taskIdentifier: req.body.taskIdentifier
    };

    if (req.body.assignedUsers) {
        updatedFields.assignedUsers = JSON.parse(req.body.assignedUsers);
    }

    // Handle images
    const newImageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    // Combine old images (sent from frontend) with new ones
    const existingImageUrls = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
    updatedFields.imageUrls = [...existingImageUrls, ...newImageUrls];
    
    // Logic to delete old images that were removed by the user
    previousTask.imageUrls.forEach(imageUrl => {
      if (!updatedFields.imageUrls.includes(imageUrl)) {
        // Construct file path and delete it
        const filePath = path.join(__dirname, 'public', imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

    // Create a log entry (optional, but good to keep)
    const log = new Log({
      taskId: req.params.id,
      previousState: { title: previousTask.title, status: previousTask.status },
      newState: { title: updatedTask.title, status: updatedTask.status },
      changeType: previousTask.status !== updatedTask.status ? 'Status Changed' : 'Task Updated',
    });
    await log.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted successfully' });
});

// GET Logs (with filtering) for the Logs Check page
app.get('/api/logs', async (req, res) => {
  try {
    const { taskIdOrName, startDate, endDate } = req.query;
    let taskIds = [];

    if (taskIdOrName) {
      const isObjectId = mongoose.Types.ObjectId.isValid(taskIdOrName);
      const taskQuery = isObjectId ? { _id: taskIdOrName } : { title: { $regex: taskIdOrName, $options: 'i' } };
      const tasks = await Task.find(taskQuery).select('_id');
      taskIds = tasks.map(task => task._id);
    }

    const logFilter = {};
    if (taskIds.length > 0) {
      logFilter.taskId = { $in: taskIds };
    }
    if (startDate && endDate) {
      logFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }

    // const logs = await Log.find(logFilter).sort({ createdAt: -1 });
    // We now 'populate' the taskId to get the 'title' field from the Task collection
        const logs = await Log.find(logFilter)
            .populate('taskId', 'title') // <-- ADD THIS
            .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
  }
});

// --- ADD NEW ROUTE: POST /api/logs/export ---
app.post('/api/logs/export', async (req, res) => {
    try {
        const { emails, taskIdOrName, startDate, endDate } = req.body;

        if (!emails) {
            return res.status(400).json({ message: 'No email addresses provided.' });
        }

        // 1. Find the logs (using the same logic as the GET route)
        let taskIds = [];
        if (taskIdOrName) {
            const isObjectId = mongoose.Types.ObjectId.isValid(taskIdOrName);
            const taskQuery = isObjectId ? { _id: taskIdOrName } : { title: { $regex: taskIdOrName, $options: 'i' } };
            const tasks = await Task.find(taskQuery).select('_id');
            taskIds = tasks.map(task => task._id);
        }
        const logFilter = {};
        if (taskIds.length > 0) logFilter.taskId = { $in: taskIds };
        if (startDate && endDate) {
            logFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
        }
        
        const logs = await Log.find(logFilter).populate('taskId', 'title').sort({ createdAt: -1 });

        // 2. Generate the PDF
        const pdfBuffer = await generateLogPdf(logs);
        const filename = `task_logs_${datetimenow()}.pdf`;

        // 3. Send the email with PDF attachment
        if (!transporter) {
           return res.status(500).json({ message: "Email service is not ready. Check server console." });
        }
        
        const info = await transporter.sendMail({
            from: '"Task Board" <noreply@taskboard.com>',
            to: emails, // Nodemailer handles comma-separated strings
            subject: 'Your Exported Task Logs',
            text: 'Please find your exported task logs attached to this email.',
            attachments: [
                {
                    filename: filename,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        console.log("✅ PDF Email Sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.status(200).json({ message: 'Logs are being emailed to you. Check your inbox (or the server console for a preview link).' });

    } catch (error) {
        console.error("Error exporting PDF:", error);
        res.status(500).json({ message: 'Error exporting logs.', error });
    }
});

// GET logs for a specific task (for the modal on the Kanban board)
app.get('/api/tasks/:id/logs', async (req, res) => {
  const logs = await Log.find({ taskId: req.params.id }).sort({ createdAt: -1 });
  res.json(logs);
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

