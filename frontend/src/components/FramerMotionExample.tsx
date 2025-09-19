import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FramerMotionExample: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Custom animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const deliveryBoxVariants = {
    idle: {
      rotate: 0,
      scale: 1
    },
    hover: {
      rotate: [0, -2, 2, -2, 0],
      scale: 1.05,
      transition: {
        duration: 0.5
      }
    },
    tap: {
      scale: 0.95,
      rotate: 0
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Custom Framer Motion Animations
        </h1>

        {/* Toggle Button */}
        <div className="text-center mb-8">
          <motion.button
            onClick={() => setIsVisible(!isVisible)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600/80 hover:bg-blue-500/80 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            {isVisible ? 'Hide' : 'Show'} Animations
          </motion.button>
        </div>

        {/* Animated Container */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Delivery Box Animation */}
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-white text-lg font-semibold mb-4">Delivery Box</h3>
                <motion.div
                  variants={deliveryBoxVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg mx-auto cursor-pointer flex items-center justify-center text-2xl"
                >
                  📦
                </motion.div>
              </motion.div>

              {/* Floating Icon */}
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-white text-lg font-semibold mb-4">Floating Delivery</h3>
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 mx-auto text-4xl"
                >
                  🚛
                </motion.div>
              </motion.div>

              {/* Progress Animation */}
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-white text-lg font-semibold mb-4">Loading Progress</h3>
                <div className="w-full bg-gray-200/20 rounded-full h-2 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>

              {/* Pulse Animation */}
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-white text-lg font-semibold mb-4">Status Indicator</h3>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  className="w-12 h-12 bg-green-500 rounded-full mx-auto"
                />
              </motion.div>

              {/* Drag Animation */}
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-white text-lg font-semibold mb-4">Draggable Item</h3>
                <motion.div
                  drag
                  dragConstraints={{
                    top: -20,
                    left: -20,
                    right: 20,
                    bottom: 20,
                  }}
                  whileDrag={{ scale: 1.1 }}
                  className="w-16 h-16 bg-purple-500 rounded-lg mx-auto cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold"
                >
                  DRAG
                </motion.div>
              </motion.div>

              {/* Morphing Shape */}
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-white text-lg font-semibold mb-4">Morphing Shape</h3>
                <motion.div
                  animate={{
                    borderRadius: ["50%", "20%", "50%", "20%", "50%"],
                    rotate: [0, 90, 180, 270, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 mx-auto"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Example: Custom Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
        >
          <h3 className="text-white text-2xl font-semibold mb-6">Delivery Timeline</h3>
          <div className="flex justify-between items-center">
            {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => (
              <motion.div
                key={step}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 + 1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    backgroundColor: index <= 2 ? "#10B981" : "#6B7280"
                  }}
                  transition={{ delay: index * 0.5 + 2 }}
                  className="w-4 h-4 rounded-full mb-2"
                />
                <span className="text-white text-sm text-center">{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FramerMotionExample;

