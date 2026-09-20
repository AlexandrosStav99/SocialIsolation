"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Check } from "lucide-react";


export default function AboutPrivacy() {

  const points = [
    "You can stop at any time.",
    "Use fictional text only in this demonstration.",
    "Consented support requests are planned, not available yet.",
  ];



  return (

    <section
      className="
      relative
      overflow-hidden

      bg-surface

      px-6
      py-20
      "
    >


      {/* background */}
      <motion.div
        animate={{
          y:[0,-20,0],
        }}

        transition={{
          duration:8,
          repeat:Infinity,
        }}

        className="
        absolute
        -right-20
        top-20

        h-72
        w-72

        rounded-full

        bg-care

        blur-[120px]
        "
      />



      <div
        className="
        relative

        mx-auto

        grid

        max-w-6xl

        gap-12

        md:grid-cols-2
        md:items-center
        "
      >



        {/* LEFT */}
        <motion.div

          initial={{
            opacity:0,
            x:-40,
          }}

          whileInView={{
            opacity:1,
            x:0,
          }}

          viewport={{
            once:true,
            amount:0.4,
          }}

          transition={{
            duration:0.7,
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

            Privacy & trust

          </span>



          <h2
            className="
            mt-5

            text-4xl
            md:text-5xl

            font-semibold

            leading-tight
            tracking-tight

            text-text
            "
          >

            Built to feel safe before it collects anything.

          </h2>




          <p
            className="
            mt-5

            max-w-xl

            text-base

            leading-relaxed

            text-muted
            "
          >

            TalkPoint is designed to avoid unnecessary data collection.
            Privacy and consent controls remain subject to implementation and validation.

          </p>



        </motion.div>







        {/* RIGHT CARD */}
        <motion.div

          initial={{
            opacity:0,
            x:40,
          }}

          whileInView={{
            opacity:1,
            x:0,
          }}

          viewport={{
            once:true,
            amount:0.4,
          }}

          transition={{
            duration:0.7,
            delay:0.15,
          }}


          className="
          rounded-[2rem]

          border
          border-border

          bg-warm-bg/80

          p-7

          shadow-sm

          backdrop-blur-md
          "
        >



          <div
            className="
            flex
            items-center
            gap-4
            "
          >


            <div
              className="
              flex

              h-14
              w-14

              items-center
              justify-center

              rounded-2xl

              bg-teal

              text-white
              "
            >

              <Lock size={24}/>

            </div>




            <div>

              <h3
                className="
                text-2xl
                font-semibold

                text-text
                "
              >

                What users should know

              </h3>


              <p className="text-sm text-muted">
                Transparency comes first
              </p>

            </div>



          </div>








          <div
            className="
            mt-8

            space-y-3
            "
          >

            {points.map((point,index)=>(

              <motion.div

                key={point}

                initial={{
                  opacity:0,
                  y:20,
                }}

                whileInView={{
                  opacity:1,
                  y:0,
                }}

                viewport={{
                  once:true,
                }}

                transition={{
                  delay:index*0.12,
                }}



                whileHover={{
                  x:6,
                }}


                className="
                flex

                items-start
                gap-4

                rounded-2xl

                border
                border-border

                bg-surface

                p-5

                shadow-sm
                "
              >



                <div
                  className="
                  flex

                  h-7
                  w-7

                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-care

                  text-teal
                  "
                >

                  <Check size={16}/>

                </div>




                <p
                  className="
                  leading-relaxed

                  text-muted
                  "
                >

                  {point}

                </p>


              </motion.div>

            ))}

          </div>



        </motion.div>



      </div>

    </section>

  );
}