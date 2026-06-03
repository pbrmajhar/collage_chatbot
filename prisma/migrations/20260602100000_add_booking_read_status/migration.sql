ALTER TABLE "Booking" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Booking_isRead_createdAt_idx" ON "Booking"("isRead", "createdAt");
