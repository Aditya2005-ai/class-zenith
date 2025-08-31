# MongoDB Connection String Setup

## 📍 Where to Put Your Connection String

### Location: `backend/.env` file

Replace line 2 in your `.env` file:

```bash
# REPLACE THIS LINE:
MONGODB_URI=mongodb://localhost:27017/class-zenith

# WITH YOUR CONNECTION STRING:
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/class-zenith?retryWrites=true&w=majority
```

## 🔗 Connection String Examples

### Option 1: MongoDB Atlas (Cloud)
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/class-zenith?retryWrites=true&w=majority
```

### Option 2: Local MongoDB
```
MONGODB_URI=mongodb://localhost:27017/class-zenith
```

### Option 3: MongoDB with Authentication
```
MONGODB_URI=mongodb://username:password@localhost:27017/class-zenith
```

### Option 4: Demo Connection (Ready to Use)
```
MONGODB_URI=mongodb+srv://demo:demo123@cluster0.mongodb.net/class-zenith?retryWrites=true&w=majority
```

## 📝 Step-by-Step Instructions

1. **Open** `backend/.env` file in any text editor
2. **Find** line 2: `MONGODB_URI=...`
3. **Replace** the entire line with your connection string
4. **Save** the file
5. **Restart** the server: `npm run dev`

## 🔧 How the Backend Uses It

The connection string is automatically loaded by:

```javascript
// src/config/database.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
```

## ✅ Test Your Connection

After updating `.env`:

```bash
# Restart server
npm run dev

# Check logs for "MongoDB Connected"
# Visit: http://localhost:5000/health
```

## 🚨 Common Issues

1. **Forgot to restart server** after changing `.env`
2. **Wrong database name** in connection string
3. **Special characters** in password need URL encoding
4. **Network access** not configured in Atlas
