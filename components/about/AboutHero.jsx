"use client";

import { motion } from "framer-motion";
import { HeartHandshake, ShieldCheck, MessageCircle } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-warm-bg px-6 py-20">

      {/* background glows */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="
          absolute
          -left-32
          top-20
          h-96
          w-96
          rounded-full
          bg-care
          blur-[130px]
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="
          absolute
          bottom-0
          right-0
          h-96
          w-96
          rounded-full
          bg-sage/50
          blur-[130px]
        "
      />




      <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">


        {/* LEFT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        >


          <span
            className="
              inline-flex
              items-center
              gap-2

              rounded-full
              bg-care

              px-5
              py-2

              text-sm
              font-medium
              text-teal
            "
          >

            <ShieldCheck size={16}/>

            Safe first. Data second. Human always.

          </span>




          <h1
            className="
            mt-8

            text-5xl
            md:text-7xl

            font-semibold

            leading-tight
            tracking-tight

            text-text
            "
          >

            A future space where{" "}
            <span className="text-teal">
              connection
            </span>{" "}
            can begin again.

          </h1>




          <p
            className="
            mt-8

            max-w-xl

            text-lg
            leading-relaxed

            text-muted
            "
          >

            TalkPoint is a university prototype for future support navigation.
            This demonstration does not provide support or send contact requests.

          </p>






          <div className="mt-10 flex gap-4">


            <motion.button
              whileHover={{
                scale: 1.05,
              }}

              whileTap={{
                scale: 0.95,
              }}

              className="
              rounded-full

              bg-teal

              px-8
              py-3

              font-medium

              text-white

              shadow-lg
              "
            >

              View demo

            </motion.button>



            <motion.button
              whileHover={{
                scale: 1.05,
              }}

              whileTap={{
                scale: 0.95,
              }}

              className="
              rounded-full

              border
              border-border

              bg-surface

              px-8
              py-3

              text-text

              shadow-sm
              "
            >

              Learn more

            </motion.button>


          </div>


        </motion.div>






        {/* RIGHT */}
        <motion.div

          initial={{
            opacity:0,
            scale:0.9,
          }}

          animate={{
            opacity:1,
            scale:1,
          }}

          transition={{
            duration:0.8,
            delay:0.2,
          }}

          className="
          relative

          rounded-[3rem]

          border
          border-border

          bg-white/60

          p-8

          shadow-xl
          shadow-black/5

          backdrop-blur-xl
          "
        >



          <motion.div

            animate={{
              y:[0,-12,0],
            }}

            transition={{
              duration:5,
              repeat:Infinity,
            }}

            className="
            rounded-[2rem]

            bg-warm-surface

            p-12

            text-center
            "
          >



            <div
              className="
              mx-auto

              flex

              h-20
              w-20

              items-center
              justify-center

              rounded-full

              bg-teal

              text-white
              "
            >

              <HeartHandshake size={36}/>

            </div>




            <h3
              className="
              mt-8

              text-3xl
              font-semibold

              text-teal
              "
            >

              You are not alone.

            </h3>




            <p
              className="
              mx-auto
              mt-5

              max-w-sm

              leading-relaxed

              text-muted
              "
            >

              Your voice matters.
              Our goal is a space to share,
              with dignity, clarity and control.

            </p>



          </motion.div>






          {/* floating card */}
          <motion.div

            animate={{
              y:[0,-10,0],
            }}

            transition={{
              duration:4,
              repeat:Infinity,
            }}

            className="
            absolute
            -bottom-6
            -left-6

            flex
            items-center
            gap-3

            rounded-2xl

            border
            border-border

            bg-surface

            px-5
            py-4

            shadow-lg
            "
          >

            <MessageCircle
              size={18}
              className="text-teal"
            />

            <span className="text-sm text-muted">
              Someone is listening
            </span>


          </motion.div>



        </motion.div>


      </div>


    </section>
  );
}