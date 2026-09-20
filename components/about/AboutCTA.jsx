"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";

export default function AboutCTA() {
  return (
    <section className="relative overflow-hidden bg-surface px-6 py-20">
      <motion.div
        animate={{ scale: [1, 1.12, 1], y: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
        className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-care blur-[120px]"
      />

      <motion.div
        animate={{ scale: [1, 1.08, 1], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sage/40 blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="
          relative
          mx-auto
          max-w-5xl
          overflow-hidden
          rounded-[3rem]
          border
          border-border
          bg-warm-bg/85
          p-10
          text-center
          shadow-xl
          shadow-black/5
          backdrop-blur-md
          md:p-16
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <span className="inline-flex rounded-full bg-care px-5 py-2 text-sm font-medium text-teal">
            Begin when you are ready
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.65 }}
          className="
            mt-6
            text-4xl
            font-semibold
            leading-tight
            tracking-tight
            text-text
            md:text-6xl
          "
        >
          You are not alone.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.65 }}
          className="
            mx-auto
            mt-6
            max-w-2xl
            text-base
            leading-relaxed
            text-muted
            md:text-lg
          "
        >
          TalkPoint is here to help you take the first small step toward
          connection. Explore this demonstration with fictional text only.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.65 }}
          className="
            mt-10
            flex
            flex-col
            justify-center
            gap-4
            sm:flex-row
          "
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/check-in"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-teal
                px-8
                py-3
                font-medium
                text-white
                shadow-lg
                shadow-black/5
                transition
                hover:opacity-90
              "
            >
              View demo
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-border
                bg-surface
                px-8
                py-3
                font-medium
                text-text
                shadow-sm
              "
            >
              <Home size={16} />
              Back home
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#2F6F6815_0%,transparent_65%)]" />
      </motion.div>
    </section>
  );
}