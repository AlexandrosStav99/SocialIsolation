"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";

export default function AboutThread() {
  return (
    <section className="relative overflow-hidden bg-warm-bg px-6 py-20">
      {/* Background */}
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-care blur-[120px]"
      />

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sage/40 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        {/* Logo card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-surface/80 p-10 shadow-sm backdrop-blur-md"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="relative z-10 flex items-center justify-center"
          >
            <Image
              src="/Logo.svg"
              width={256}
              height={171}
              alt="TalkPoint continuous thread logo"
              className="w-64 h-auto scale-[2.2]"
            />
          </motion.div>

          <div className="absolute inset-0 bg-[radial-gradient(circle,#2F6F6818_0%,transparent_65%)]" />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="absolute bottom-6 left-6 rounded-2xl border border-border bg-warm-bg/90 px-4 py-3 text-sm font-medium text-teal shadow-sm backdrop-blur-md"
          >
            one continuous thread
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-care px-5 py-2 text-sm font-medium text-teal">
            <PenLine size={16} />
            The thread
          </span>

          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-text md:text-5xl">
            A quiet line that does not break.
          </h2>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
            <p>
              The TalkPoint logo is based on one continuous line. It represents
              connection, continuity and quiet resilience.
            </p>

            <p>
              The line feels soft and human, like a drawing made without lifting
              the pencil — a small sign that connection can still exist, even when
              someone feels isolated.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Connection", "Continuity", "Resilience"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.12 }}
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-sm font-medium text-teal shadow-sm"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}