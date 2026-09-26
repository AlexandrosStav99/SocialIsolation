"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IntegratedCheckIn from "@/components/check-in/IntegratedCheckIn";

export default function CheckInPage() {
  return (
    <>
      <Navbar />
      <IntegratedCheckIn />
      <Footer />
    </>
  );
}
