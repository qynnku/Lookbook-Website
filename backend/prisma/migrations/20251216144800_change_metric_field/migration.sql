-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "brandId" INTEGER,
    CONSTRAINT "User_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "followers" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brandId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "newReach" INTEGER NOT NULL,
    "postViews" INTEGER NOT NULL,
    "pageVisits" INTEGER NOT NULL,
    "contentScore" INTEGER NOT NULL,
    "changeVsYesterday" REAL NOT NULL,
    CONSTRAINT "MetricSnapshot_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brandId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    CONSTRAINT "WeeklyTask_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brandId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "ChannelConnection_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
