import { motion } from "framer-motion";
import { ZWAP_LOGO } from "@/App";

...

<motion.div
  className="flex justify-center mb-6"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  <motion.img
    src={ZWAP_LOGO}
    alt="ZWAP!"
    className="w-28 sm:w-32 md:w-36 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
    animate={{
      y: [0, -6, 0],
      scale: [1, 1.04, 1],
      filter: [
        "drop-shadow(0 0 12px rgba(34,211,238,0.25))",
        "drop-shadow(0 0 28px rgba(168,85,247,0.45))",
        "drop-shadow(0 0 12px rgba(34,211,238,0.25))",
      ],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
</motion.div>