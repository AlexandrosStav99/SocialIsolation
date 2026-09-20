"use client";

import { motion } from "framer-motion";
import { MessageCircle, Brain, HeartHandshake } from "lucide-react";


export default function AboutHowItWorks() {

  const steps = [
    {
      icon: MessageCircle,
      title: "Share safely",
      text:
        "Users can express how they feel in a calm and low-pressure way.",
    },
    {
      icon: Brain,
      title: "Understand needs",
      text:
        "TalkPoint helps identify what kind of support may be useful.",
    },
    {
      icon: HeartHandshake,
      title: "Connect to support",
      text:
        "When the user chooses, their request can be guided toward the right support service.",
    },
  ];



  return (
    <section
      className="
      relative
      overflow-hidden
      bg-warm-bg
      px-6
      py-20
      "
    >

      {/* Background */}
      <motion.div
        animate={{ y:[0,-20,0] }}
        transition={{
          duration:8,
          repeat:Infinity,
        }}
        className="
        absolute
        -left-24
        top-20
        h-72
        w-72
        rounded-full
        bg-care
        blur-[120px]
        "
      />


      <motion.div
        animate={{ scale:[1,1.1,1] }}
        transition={{
          duration:10,
          repeat:Infinity,
        }}
        className="
        absolute
        bottom-0
        right-0
        h-72
        w-72
        rounded-full
        bg-sage/40
        blur-[120px]
        "
      />




      <div className="relative mx-auto max-w-6xl">


        {/* Header */}
        <motion.div

          initial={{
            opacity:0,
            y:30,
          }}

          whileInView={{
            opacity:1,
            y:0,
          }}

          viewport={{
            once:true,
            amount:0.4,
          }}

          transition={{
            duration:0.7,
          }}

          className="max-w-3xl"
        >

          <span
            className="
            inline-flex
            rounded-full
            bg-care
            px-5
            py-2
            text-sm
            font-medium
            text-teal
            "
          >
            Planned journey
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
            A gentle path from sharing to support.
          </h2>


          <p
            className="
            mt-4
            max-w-2xl
            text-base
            leading-relaxed
            text-muted
            "
          >
            The following journey is planned and not yet implemented. The user will stay in control
            at every step.
          </p>


        </motion.div>







        {/* Steps */}
        <div
          className="
          mt-10
          space-y-4
          "
        >

          {steps.map((step,index)=>{

            const Icon = step.icon;


            return(

              <motion.div

                key={step.title}

                initial={{
                  opacity:0,
                  x:-30,
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
                  duration:0.6,
                  delay:index*0.12,
                }}


                className="
                group
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-center
                "
              >


                {/* Icon */}
                <motion.div

                  whileHover={{
                    rotate:5,
                    scale:1.08,
                  }}

                  className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-teal
                  text-white
                  shadow-lg
                  "
                >

                  <Icon size={22}/>

                </motion.div>





                {/* Card */}
                <motion.div

                  whileHover={{
                    y:-4,
                  }}

                  className="
                  relative
                  flex-1
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  bg-surface/80
                  p-6
                  shadow-sm
                  backdrop-blur-md
                  "
                >


                  <span
                    className="
                    text-xs
                    font-semibold
                    text-teal/50
                    "
                  >
                    STEP 0{index+1}
                  </span>


                  <h3
                    className="
                    mt-2
                    text-xl
                    font-semibold
                    text-text
                    "
                  >
                    {step.title}
                  </h3>


                  <p
                    className="
                    mt-2
                    text-sm
                    leading-relaxed
                    text-muted
                    "
                  >
                    {step.text}
                  </p>



                  <div
                    className="
                    absolute
                    bottom-0
                    left-0
                    h-1
                    w-0
                    bg-teal
                    transition-all
                    duration-500
                    group-hover:w-full
                    "
                  />

                </motion.div>

              </motion.div>

            )

          })}

        </div>


      </div>

    </section>
  );
}