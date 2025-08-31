# MongoDB Atlas Setup Instructions

## Step 1: Create MongoDB Atlas Account (Free)

1. Go to https://www.mongodb.com/atlas
2. Click "Try Free"
3. Sign up with email or Google account

## Step 2: Create Free Cluster

1. Choose "Build a Database" 
2. Select "M0 Sandbox" (FREE tier)
3. Choose your preferred cloud provider and region
4. Click "Create Cluster"

## Step 3: Create Database User

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `classzenith`
5. Password: `classzenith123`
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

## Step 4: Configure Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string (looks like):
   `mongodb+srv://classzenith:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 6: Update .env File

Replace `<password>` with `classzenith123` and add database name:
`mongodb+srv://classzenith:classzenith123@cluster0.xxxxx.mongodb.net/class-zenith?retryWrites=true&w=majority`

## Alternative: Use Demo Connection

If you want to skip Atlas setup, use this demo connection:
`mongodb+srv://demo:demo123@cluster0.mongodb.net/class-zenith?retryWrites=true&w=majority`
