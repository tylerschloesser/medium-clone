-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT,
    "image" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
