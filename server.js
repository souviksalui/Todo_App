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

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI.trim())
  .then(() => console.log('✅ MongoDB Atlas connected successfully!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- Mongoose Schemas & Models ---
// Updated Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['To Do', 'Doing', 'Done'], default: 'To Do' },
  tags: [String],
  imageUrls: [String]
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

    const newTask = new Task({
      title: req.body.title,
      description: req.body.description,
      status: 'To Do',
      tags: tags,
      imageUrls: imageUrls
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
});

// PUT (Update) a Task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const previousTask = await Task.findById(req.params.id);
    if (!previousTask) return res.status(404).json({ message: 'Task not found' });
    
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const log = new Log({
      taskId: req.params.id,
      previousState: { title: previousTask.title, status: previousTask.status, tags: previousTask.tags, description: previousTask.description },
      newState: { title: updatedTask.title, status: updatedTask.status, tags: updatedTask.tags, description: updatedTask.description },
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

    const logs = await Log.find(logFilter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
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

