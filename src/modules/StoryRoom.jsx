import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'
import { speakThenAdvance } from '../utils/speechAdvance'
import { dailySeedFor, seededShuffle } from '../utils/seededRandom'
import { THEMES } from '../themes'
import { buildEarlyPersonalisedStory } from '../utils/personalisedStories.js'

// ── Animated scene layers per story page ────────────────────────────────────
// Each item: { emoji, left, top, size, animate, duration, delay }
const PAGE_SCENES = {
  // Story 1: Marina
  '1-0': [ // beach
    { emoji: '🌊', left: '2%',  top: '55%', size: 3.5, dur: 2.5, delay: 0,   anim: { x: [0, 18, 0] } },
    { emoji: '🌊', left: '45%', top: '65%', size: 2.8, dur: 2.8, delay: 0.9, anim: { x: [0, -14, 0] } },
    { emoji: '🌴', left: '72%', top: '8%',  size: 4,   dur: 3.2, delay: 0,   anim: { rotate: [-6, 6, -6] } },
    { emoji: '☀️', left: '6%',  top: '4%',  size: 3,   dur: 8,   delay: 0,   anim: { rotate: [0, 360] } },
    { emoji: '🐚', left: '28%', top: '72%', size: 2,   dur: 2.2, delay: 1.1, anim: { y: [0, -10, 0] } },
    { emoji: '🌺', left: '85%', top: '60%', size: 1.8, dur: 3,   delay: 0.5, anim: { rotate: [0, 20, 0] } },
  ],
  '1-1': [ // shell glows rainbow
    { emoji: '✨', left: '10%', top: '15%', size: 2.2, dur: 1.2, delay: 0,   anim: { scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] } },
    { emoji: '✨', left: '75%', top: '20%', size: 1.8, dur: 1.5, delay: 0.4, anim: { scale: [1, 2, 1], opacity: [0.4, 1, 0.4] } },
    { emoji: '✨', left: '50%', top: '70%', size: 1.6, dur: 1.3, delay: 0.8, anim: { scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] } },
    { emoji: '🌈', left: '5%',  top: '5%',  size: 3.5, dur: 4,   delay: 0,   anim: { opacity: [0.4, 0.9, 0.4], y: [0, -5, 0] } },
    { emoji: '💫', left: '60%', top: '45%', size: 2.5, dur: 2,   delay: 0.2, anim: { rotate: [0, 360] } },
    { emoji: '⭐', left: '88%', top: '55%', size: 1.8, dur: 1.8, delay: 0.6, anim: { scale: [1, 1.5, 1] } },
  ],
  '1-2': [ // ocean sings
    { emoji: '🌊', left: '0%',  top: '50%', size: 3.5, dur: 2,   delay: 0,   anim: { x: [0, 22, 0] } },
    { emoji: '🌊', left: '55%', top: '60%', size: 3,   dur: 2.4, delay: 0.7, anim: { x: [0, -18, 0] } },
    { emoji: '🎵', left: '20%', top: '75%', size: 2,   dur: 2.5, delay: 0,   anim: { y: [0, -80], opacity: [1, 0] } },
    { emoji: '🎶', left: '55%', top: '80%', size: 1.8, dur: 3,   delay: 0.8, anim: { y: [0, -100], opacity: [1, 0] } },
    { emoji: '🎵', left: '80%', top: '72%', size: 1.6, dur: 2.8, delay: 1.4, anim: { y: [0, -70], opacity: [1, 0] } },
    { emoji: '🐠', left: '85%', top: '55%', size: 2.2, dur: 3,   delay: 0.3, anim: { x: [0, -20, 0], y: [0, -8, 0] } },
  ],
  '1-3': [ // dolphin!
    { emoji: '🐬', left: '15%', top: '40%', size: 3.5, dur: 1.8, delay: 0,   anim: { y: [0, -40, 0] } },
    { emoji: '💦', left: '8%',  top: '65%', size: 2.5, dur: 1,   delay: 0.4, anim: { scale: [1, 2, 0], opacity: [1, 0.6, 0] } },
    { emoji: '💦', left: '35%', top: '68%', size: 2,   dur: 1.2, delay: 0.9, anim: { scale: [1, 2.5, 0], opacity: [1, 0.6, 0] } },
    { emoji: '🌊', left: '55%', top: '58%', size: 3,   dur: 2.5, delay: 0,   anim: { x: [0, 16, 0] } },
    { emoji: '🌊', left: '0%',  top: '68%', size: 3.5, dur: 2.2, delay: 1,   anim: { x: [0, 20, 0] } },
    { emoji: '⭐', left: '80%', top: '15%', size: 1.8, dur: 2,   delay: 0.5, anim: { scale: [1, 1.4, 1] } },
  ],
  '1-4': [ // secret island treasure
    { emoji: '🏝️', left: '5%',  top: '50%', size: 3,   dur: 3,   delay: 0,   anim: { y: [0, -12, 0] } },
    { emoji: '💎', left: '70%', top: '20%', size: 2.2, dur: 1.5, delay: 0.3, anim: { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] } },
    { emoji: '💎', left: '25%', top: '70%', size: 1.8, dur: 1.8, delay: 0.7, anim: { scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] } },
    { emoji: '🌺', left: '82%', top: '55%', size: 2,   dur: 2.5, delay: 0,   anim: { rotate: [0, 25, 0] } },
    { emoji: '🌟', left: '50%', top: '10%', size: 2.5, dur: 2,   delay: 0.4, anim: { scale: [1, 1.4, 1] } },
    { emoji: '🦜', left: '60%', top: '30%', size: 2,   dur: 2.8, delay: 0.2, anim: { x: [0, 12, 0], y: [0, -8, 0] } },
  ],
  '1-5': [ // sharing treasure celebration
    { emoji: '❤️', left: '15%', top: '75%', size: 2,   dur: 2.5, delay: 0,   anim: { y: [0, -100], opacity: [1, 0] } },
    { emoji: '💛', left: '40%', top: '80%', size: 1.8, dur: 3,   delay: 0.5, anim: { y: [0, -120], opacity: [1, 0] } },
    { emoji: '💚', left: '65%', top: '78%', size: 2,   dur: 2.8, delay: 1,   anim: { y: [0, -110], opacity: [1, 0] } },
    { emoji: '🌺', left: '80%', top: '20%', size: 2.5, dur: 3,   delay: 0,   anim: { rotate: [0, 360] } },
    { emoji: '🌺', left: '5%',  top: '25%', size: 2.2, dur: 2.5, delay: 0.8, anim: { rotate: [0, -360] } },
    { emoji: '🎉', left: '45%', top: '15%', size: 2.8, dur: 1.2, delay: 0.3, anim: { scale: [1, 1.5, 1] } },
  ],

  // Story 2: Snow
  '2-0': [ // snow kingdom
    { emoji: '❄️', left: '10%', top: '-5%', size: 2,   dur: 3,   delay: 0,   anim: { y: [0, 200] } },
    { emoji: '❄️', left: '35%', top: '-8%', size: 1.6, dur: 4,   delay: 0.7, anim: { y: [0, 220] } },
    { emoji: '❄️', left: '65%', top: '-5%', size: 2.2, dur: 3.5, delay: 1.2, anim: { y: [0, 210] } },
    { emoji: '❄️', left: '85%', top: '-5%', size: 1.8, dur: 3.8, delay: 0.3, anim: { y: [0, 200] } },
    { emoji: '⛄', left: '65%', top: '50%', size: 3,   dur: 2,   delay: 0,   anim: { y: [0, -12, 0] } },
    { emoji: '✨', left: '20%', top: '30%', size: 1.8, dur: 1.5, delay: 0.5, anim: { opacity: [0.3, 1, 0.3] } },
  ],
  '2-1': [ // making snowman
    { emoji: '❄️', left: '5%',  top: '-5%', size: 2.4, dur: 2.8, delay: 0,   anim: { y: [0, 210], rotate: [0, 180] } },
    { emoji: '❄️', left: '28%', top: '-8%', size: 1.8, dur: 3.5, delay: 0.5, anim: { y: [0, 230], rotate: [0, -180] } },
    { emoji: '❄️', left: '55%', top: '-5%', size: 2.8, dur: 2.5, delay: 1,   anim: { y: [0, 220], rotate: [0, 180] } },
    { emoji: '❄️', left: '78%', top: '-5%', size: 2,   dur: 3.2, delay: 0.3, anim: { y: [0, 200], rotate: [0, -180] } },
    { emoji: '🌨️', left: '90%', top: '-5%', size: 2.5, dur: 3.8, delay: 1.5, anim: { y: [0, 210] } },
    { emoji: '🧤', left: '15%', top: '30%', size: 2.5, dur: 2,   delay: 0.2, anim: { rotate: [-10, 10, -10] } },
  ],
  '2-2': [ // dancing snowflakes
    { emoji: '💎', left: '20%', top: '20%', size: 2.5, dur: 3,   delay: 0,   anim: { rotate: [0, 360], scale: [1, 1.2, 1] } },
    { emoji: '❄️', left: '70%', top: '15%', size: 2,   dur: 2.5, delay: 0.4, anim: { rotate: [0, -360], y: [0, 10, 0] } },
    { emoji: '❄️', left: '45%', top: '60%', size: 2.8, dur: 3.2, delay: 0.8, anim: { rotate: [0, 360], x: [0, 15, 0] } },
    { emoji: '❄️', left: '10%', top: '55%', size: 1.8, dur: 2.8, delay: 1.2, anim: { rotate: [0, -360] } },
    { emoji: '✨', left: '85%', top: '50%', size: 2,   dur: 1.5, delay: 0,   anim: { opacity: [0.3, 1, 0.3] } },
    { emoji: '💫', left: '55%', top: '25%', size: 2.2, dur: 2,   delay: 0.6, anim: { rotate: [0, 360] } },
  ],
  '2-3': [ // Anna with mittens
    { emoji: '🧤', left: '75%', top: '20%', size: 2.8, dur: 2,   delay: 0,   anim: { y: [0, -15, 0], rotate: [-5, 5, -5] } },
    { emoji: '❄️', left: '15%', top: '-5%', size: 2,   dur: 3,   delay: 0,   anim: { y: [0, 200] } },
    { emoji: '❄️', left: '50%', top: '-5%', size: 1.6, dur: 3.5, delay: 1,   anim: { y: [0, 220] } },
    { emoji: '🌟', left: '85%', top: '60%', size: 2,   dur: 2,   delay: 0.3, anim: { scale: [1, 1.4, 1] } },
    { emoji: '💙', left: '30%', top: '65%', size: 1.8, dur: 2.5, delay: 0.7, anim: { y: [0, -80], opacity: [1, 0] } },
    { emoji: '❤️', left: '60%', top: '70%', size: 2,   dur: 3,   delay: 0.4, anim: { y: [0, -90], opacity: [1, 0] } },
  ],
  '2-4': [ // ice castle
    { emoji: '❄️', left: '8%',  top: '-5%', size: 2.2, dur: 3,   delay: 0,   anim: { y: [0, 210] } },
    { emoji: '❄️', left: '45%', top: '-5%', size: 1.8, dur: 3.5, delay: 0.8, anim: { y: [0, 220] } },
    { emoji: '❄️', left: '80%', top: '-5%', size: 2.5, dur: 2.8, delay: 1.5, anim: { y: [0, 200] } },
    { emoji: '✨', left: '22%', top: '25%', size: 2,   dur: 1.5, delay: 0.2, anim: { opacity: [0.3, 1, 0.3] } },
    { emoji: '✨', left: '68%', top: '40%', size: 1.8, dur: 1.8, delay: 0.6, anim: { opacity: [0.4, 1, 0.4] } },
    { emoji: '🏰', left: '5%',  top: '45%', size: 2.5, dur: 3,   delay: 0,   anim: { y: [0, -8, 0] } },
  ],
  '2-5': [ // stars come out
    { emoji: '⭐', left: '8%',  top: '10%', size: 2.2, dur: 1.8, delay: 0,   anim: { opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] } },
    { emoji: '⭐', left: '55%', top: '5%',  size: 1.8, dur: 2.2, delay: 0.5, anim: { opacity: [0.2, 1, 0.2], scale: [1, 1.2, 1] } },
    { emoji: '⭐', left: '85%', top: '15%', size: 2,   dur: 2,   delay: 1,   anim: { opacity: [0.3, 1, 0.3] } },
    { emoji: '🌟', left: '30%', top: '20%', size: 2.8, dur: 1.5, delay: 0.3, anim: { scale: [1, 1.5, 1] } },
    { emoji: '💫', left: '72%', top: '35%', size: 2.2, dur: 2.5, delay: 0.7, anim: { rotate: [0, 360] } },
    { emoji: '🌙', left: '55%', top: '8%',  size: 2.5, dur: 4,   delay: 0,   anim: { y: [0, -5, 0] } },
  ],

  // Story 3: Bloom
  '3-0': [ // loves muddy puddles
    { emoji: '🌧️', left: '5%',  top: '-5%', size: 2.2, dur: 2,   delay: 0,   anim: { y: [0, 180] } },
    { emoji: '🌧️', left: '35%', top: '-8%', size: 1.8, dur: 2.5, delay: 0.6, anim: { y: [0, 200] } },
    { emoji: '🌧️', left: '70%', top: '-5%', size: 2,   dur: 2.2, delay: 1.1, anim: { y: [0, 190] } },
    { emoji: '🐷', left: '68%', top: '45%', size: 3,   dur: 1.5, delay: 0,   anim: { y: [0, -20, 0] } },
    { emoji: '💧', left: '20%', top: '60%', size: 2,   dur: 1.8, delay: 0.4, anim: { y: [0, 30], opacity: [1, 0] } },
    { emoji: '💧', left: '50%', top: '65%', size: 1.8, dur: 2,   delay: 0.9, anim: { y: [0, 25], opacity: [1, 0] } },
  ],
  '3-1': [ // biggest puddle
    { emoji: '💧', left: '8%',  top: '-5%', size: 2.5, dur: 1.8, delay: 0,   anim: { y: [0, 200] } },
    { emoji: '💧', left: '30%', top: '-5%', size: 2,   dur: 2.2, delay: 0.4, anim: { y: [0, 210] } },
    { emoji: '💧', left: '55%', top: '-5%', size: 2.8, dur: 2,   delay: 0.8, anim: { y: [0, 200] } },
    { emoji: '💧', left: '78%', top: '-5%', size: 2.2, dur: 1.9, delay: 1.2, anim: { y: [0, 190] } },
    { emoji: '🌧️', left: '90%', top: '-5%', size: 2,   dur: 2.5, delay: 0.3, anim: { y: [0, 210] } },
    { emoji: '🌊', left: '20%', top: '62%', size: 3,   dur: 2.5, delay: 0,   anim: { x: [0, 20, 0] } },
  ],
  '3-2': [ // Daddy's GIANT splash
    { emoji: '💦', left: '20%', top: '50%', size: 3,   dur: 0.8, delay: 0,   anim: { scale: [1, 3, 0], opacity: [1, 0.5, 0] } },
    { emoji: '💦', left: '45%', top: '55%', size: 2.5, dur: 1,   delay: 0.2, anim: { scale: [1, 2.5, 0], opacity: [1, 0.5, 0] } },
    { emoji: '💦', left: '70%', top: '48%', size: 2.8, dur: 0.9, delay: 0.4, anim: { scale: [1, 3, 0], opacity: [1, 0.5, 0] } },
    { emoji: '🌊', left: '0%',  top: '60%', size: 3.5, dur: 2,   delay: 0,   anim: { x: [0, 25, 0] } },
    { emoji: '🌊', left: '55%', top: '68%', size: 3,   dur: 2.2, delay: 0.5, anim: { x: [0, -20, 0] } },
    { emoji: '😮', left: '78%', top: '20%', size: 2.5, dur: 1.5, delay: 0.8, anim: { scale: [1, 1.3, 1] } },
  ],
  '3-3': [ // Leo covered in mud
    { emoji: '😄', left: '72%', top: '30%', size: 2.8, dur: 1.5, delay: 0,   anim: { y: [0, -15, 0] } },
    { emoji: '🌿', left: '5%',  top: '40%', size: 2.5, dur: 2.5, delay: 0,   anim: { rotate: [-8, 8, -8] } },
    { emoji: '🌿', left: '78%', top: '55%', size: 2,   dur: 2.8, delay: 0.5, anim: { rotate: [5, -10, 5] } },
    { emoji: '💚', left: '25%', top: '72%', size: 1.8, dur: 2.5, delay: 0,   anim: { y: [0, -90], opacity: [1, 0] } },
    { emoji: '💚', left: '55%', top: '78%', size: 2,   dur: 3,   delay: 0.7, anim: { y: [0, -100], opacity: [1, 0] } },
    { emoji: '🍃', left: '40%', top: '20%', size: 2,   dur: 3.5, delay: 0.3, anim: { x: [0, 20, 0], y: [0, 15, 0], rotate: [0, 30, 0] } },
  ],
  '3-4': [ // Mummy jumps in
    { emoji: '🎉', left: '40%', top: '15%', size: 3,   dur: 1,   delay: 0,   anim: { scale: [1, 1.6, 1] } },
    { emoji: '💦', left: '15%', top: '52%', size: 2.5, dur: 0.9, delay: 0.2, anim: { scale: [1, 2.5, 0], opacity: [1, 0.5, 0] } },
    { emoji: '💦', left: '60%', top: '55%', size: 3,   dur: 1,   delay: 0.3, anim: { scale: [1, 3, 0], opacity: [1, 0.5, 0] } },
    { emoji: '🌸', left: '80%', top: '25%', size: 2,   dur: 2.5, delay: 0,   anim: { y: [0, -60], opacity: [1, 0], rotate: [0, 180] } },
    { emoji: '🌸', left: '12%', top: '30%', size: 1.8, dur: 3,   delay: 0.6, anim: { y: [0, -70], opacity: [1, 0], rotate: [0, -180] } },
    { emoji: '😂', left: '50%', top: '60%', size: 2.5, dur: 1.5, delay: 0.5, anim: { scale: [1, 1.4, 1] } },
  ],
  '3-5': [ // rainbow day
    { emoji: '🌈', left: '5%',  top: '5%',  size: 4,   dur: 4,   delay: 0,   anim: { opacity: [0.5, 1, 0.5], y: [0, -8, 0] } },
    { emoji: '☀️', left: '72%', top: '3%',  size: 3,   dur: 6,   delay: 0,   anim: { rotate: [0, 360] } },
    { emoji: '🌸', left: '20%', top: '75%', size: 2,   dur: 3,   delay: 0,   anim: { y: [0, -80], opacity: [1, 0] } },
    { emoji: '🌸', left: '55%', top: '80%', size: 1.8, dur: 3.5, delay: 0.8, anim: { y: [0, -90], opacity: [1, 0] } },
    { emoji: '🌻', left: '80%', top: '55%', size: 2.2, dur: 2.5, delay: 0.3, anim: { rotate: [-5, 10, -5] } },
    { emoji: '🐦', left: '35%', top: '35%', size: 2,   dur: 2,   delay: 0.5, anim: { x: [0, 30, 60], opacity: [1, 1, 0] } },
  ],

  // ── Story 4: Yaagvi ──────────────────────────────────────────────────────
  '4-0': [ // bravest explorer
    { emoji: '🔭', left: '72%', top: '20%', size: 3,   dur: 4,   delay: 0,   anim: { rotate: [-10, 10, -10] } },
    { emoji: '🌟', left: '10%', top: '15%', size: 2.2, dur: 1.8, delay: 0,   anim: { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } },
    { emoji: '🌟', left: '50%', top: '8%',  size: 1.8, dur: 2.2, delay: 0.5, anim: { scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] } },
    { emoji: '🌍', left: '5%',  top: '45%', size: 3,   dur: 6,   delay: 0,   anim: { rotate: [0, 360] } },
    { emoji: '⭐', left: '85%', top: '55%', size: 1.8, dur: 1.5, delay: 0.8, anim: { opacity: [0.3, 1, 0.3] } },
    { emoji: '💫', left: '55%', top: '55%', size: 2.5, dur: 2,   delay: 0.4, anim: { rotate: [0, 360] } },
  ],
  '4-1': [ // packing the bag
    { emoji: '🎒', left: '68%', top: '35%', size: 3,   dur: 2,   delay: 0,   anim: { y: [0, -15, 0], rotate: [-5, 5, -5] } },
    { emoji: '🍪', left: '20%', top: '25%', size: 2,   dur: 2.5, delay: 0.3, anim: { y: [0, -20, 0], rotate: [0, 20, 0] } },
    { emoji: '🍪', left: '50%', top: '65%', size: 1.8, dur: 2.8, delay: 0.8, anim: { y: [0, -15, 0] } },
    { emoji: '🗺️', left: '5%',  top: '50%', size: 2.5, dur: 3,   delay: 0,   anim: { x: [0, 12, 0], rotate: [-3, 3, -3] } },
    { emoji: '🔦', left: '78%', top: '60%', size: 2,   dur: 2.2, delay: 0.5, anim: { rotate: [-15, 15, -15] } },
    { emoji: '🌟', left: '38%', top: '15%', size: 2.2, dur: 1.8, delay: 0.2, anim: { opacity: [0.4, 1, 0.4] } },
  ],
  '4-2': [ // talking butterfly
    { emoji: '🦋', left: '15%', top: '35%', size: 3,   dur: 3,   delay: 0,   anim: { x: [0, 200, 230], y: [0, -30, 10], opacity: [1, 1, 0] } },
    { emoji: '🌿', left: '5%',  top: '55%', size: 2.5, dur: 2.5, delay: 0,   anim: { rotate: [-8, 8, -8] } },
    { emoji: '🌿', left: '72%', top: '60%', size: 3,   dur: 3,   delay: 0.4, anim: { rotate: [5, -10, 5] } },
    { emoji: '🌸', left: '55%', top: '20%', size: 2,   dur: 2.8, delay: 0.6, anim: { y: [0, -10, 0], rotate: [0, 20, 0] } },
    { emoji: '🌸', left: '30%', top: '70%', size: 1.8, dur: 3.2, delay: 1,   anim: { y: [0, -8, 0] } },
    { emoji: '🍃', left: '88%', top: '30%', size: 2,   dur: 3.5, delay: 0.2, anim: { x: [0, -15, 0], rotate: [0, 25, 0] } },
  ],
  '4-3': [ // starlight waterfall
    { emoji: '⭐', left: '15%', top: '-5%', size: 2.2, dur: 2,   delay: 0,   anim: { y: [0, 220] } },
    { emoji: '⭐', left: '30%', top: '-5%', size: 1.8, dur: 2.5, delay: 0.3, anim: { y: [0, 230] } },
    { emoji: '⭐', left: '50%', top: '-5%', size: 2.5, dur: 2.2, delay: 0.6, anim: { y: [0, 215] } },
    { emoji: '⭐', left: '65%', top: '-5%', size: 1.6, dur: 2.8, delay: 0.9, anim: { y: [0, 225] } },
    { emoji: '💫', left: '80%', top: '-5%', size: 2,   dur: 2.4, delay: 0.2, anim: { y: [0, 210], rotate: [0, 360] } },
    { emoji: '🌟', left: '40%', top: '55%', size: 2.5, dur: 1.8, delay: 0.4, anim: { scale: [1, 1.6, 1] } },
  ],
  '4-4': [ // writing adventure book
    { emoji: '✏️', left: '70%', top: '30%', size: 2.5, dur: 1.5, delay: 0,   anim: { rotate: [-15, 15, -15], y: [0, -5, 0] } },
    { emoji: '📚', left: '10%', top: '45%', size: 2.8, dur: 2.5, delay: 0.3, anim: { y: [0, -10, 0], rotate: [-3, 3, -3] } },
    { emoji: '💡', left: '80%', top: '15%', size: 2.2, dur: 1.8, delay: 0,   anim: { opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] } },
    { emoji: '🌟', left: '35%', top: '15%', size: 1.8, dur: 2,   delay: 0.5, anim: { opacity: [0.3, 1, 0.3] } },
    { emoji: '⭐', left: '55%', top: '70%', size: 2,   dur: 2.2, delay: 0.8, anim: { opacity: [0.4, 1, 0.4] } },
    { emoji: '🖊️', left: '45%', top: '40%', size: 1.8, dur: 2,   delay: 0.6, anim: { rotate: [0, 15, 0], y: [0, -8, 0] } },
  ],
  '4-5': [ // coming home, next adventure
    { emoji: '🌙', left: '65%', top: '5%',  size: 3.5, dur: 4,   delay: 0,   anim: { y: [0, -8, 0], opacity: [0.7, 1, 0.7] } },
    { emoji: '⭐', left: '10%', top: '8%',  size: 2,   dur: 1.8, delay: 0,   anim: { opacity: [0.3, 1, 0.3] } },
    { emoji: '⭐', left: '40%', top: '5%',  size: 1.6, dur: 2.2, delay: 0.6, anim: { opacity: [0.2, 1, 0.2] } },
    { emoji: '⭐', left: '85%', top: '20%', size: 2,   dur: 2,   delay: 1.1, anim: { opacity: [0.3, 1, 0.3] } },
    { emoji: '🌟', left: '25%', top: '40%', size: 2.5, dur: 1.5, delay: 0.4, anim: { scale: [1, 1.5, 1] } },
    { emoji: '🏠', left: '5%',  top: '55%', size: 2.5, dur: 2.8, delay: 0.2, anim: { y: [0, -8, 0] } },
  ],
}

// ── SceneLayer component ─────────────────────────────────────────────────────
function SceneLayer({ storyId, pageIdx }) {
  const key = `${storyId}-${pageIdx}`
  const scene = PAGE_SCENES[key] || []
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {scene.map((el, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{ left: el.left, top: el.top, fontSize: `${el.size}rem`, lineHeight: 1 }}
          animate={el.anim}
          transition={{
            duration: el.dur,
            delay: el.delay || 0,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {el.emoji}
        </motion.div>
      ))}
    </div>
  )
}

// ── Story data ───────────────────────────────────────────────────────────────
const STORIES = [
  {
    id: 1,
    title: "Marina and the Magic Shell",
    emoji: "🌊",
    cover: "🌺",
    pages: [
      { text: "Marina found a beautiful shell on the beach.", emoji: "🐚", bg: "from-teal-400 to-cyan-500" },
      { text: "The shell shimmered and glowed with rainbow light.", emoji: "✨", bg: "from-purple-400 to-pink-500" },
      { text: "She held it to her ear and heard the ocean sing.", emoji: "🌊", bg: "from-blue-400 to-teal-500" },
      { text: "A friendly dolphin swam up to say hello!", emoji: "🐬", bg: "from-cyan-400 to-blue-500" },
      { text: "Together they swam to a secret island full of treasure!", emoji: "🏝️", bg: "from-emerald-400 to-teal-600" },
      { text: "Marina shared the treasure with everyone she loved. The End!", emoji: "❤️", bg: "from-orange-400 to-rose-500" },
    ]
  },
  {
    id: 2,
    title: "Snow's Magical Snow Day",
    emoji: "❄️",
    cover: "⛄",
    pages: [
      { text: "Snow woke up to find her garden covered in sparkling snow.", emoji: "❄️", bg: "from-sky-400 to-blue-500" },
      { text: "She clapped her hands and made a giant snowman!", emoji: "⛄", bg: "from-blue-300 to-indigo-400" },
      { text: "Little snowflakes danced around her like tiny diamonds.", emoji: "💎", bg: "from-indigo-400 to-violet-500" },
      { text: "Her friend came running out in warm red mittens.", emoji: "🧤", bg: "from-red-400 to-orange-400" },
      { text: "Together the sisters built the most magical ice castle!", emoji: "🏰", bg: "from-sky-300 to-cyan-500" },
      { text: "They laughed and played until the stars came out. The End! ⭐", emoji: "🌟", bg: "from-violet-400 to-purple-600" },
    ]
  },
  {
    id: 3,
    title: "Bloom's Muddy Puddle Adventure",
    emoji: "🐷",
    cover: "💧",
    pages: [
      { text: "Bloom loved jumping in muddy puddles more than anything!", emoji: "🐷", bg: "from-pink-400 to-rose-500" },
      { text: "One day she found the biggest muddy puddle she had ever seen!", emoji: "💧", bg: "from-amber-400 to-orange-400" },
      { text: "Dad jumped first and made a giant splash!", emoji: "💦", bg: "from-blue-400 to-cyan-500" },
      { text: "Leo jumped next and got covered head to toe in mud!", emoji: "😄", bg: "from-green-400 to-emerald-500" },
      { text: "Even Mum could not resist, so she jumped in too!", emoji: "🎉", bg: "from-purple-400 to-pink-500" },
      { text: "Everyone laughed and had a wonderful muddy day! The End! 🌈", emoji: "🌈", bg: "from-orange-400 to-pink-500" },
    ]
  },
  {
    id: 4,
    title: "Yaagvi the Brave Explorer",
    emoji: "🔭",
    cover: "🌟",
    pages: [
      { text: "Yaagvi was the bravest explorer in the whole wide world!", emoji: "🔭", image: "/stories/yaagvi-explorer/page-1.png", bg: "from-violet-500 to-purple-600" },
      { text: "She packed her bag with a map, a torch, and lots of biscuits.", emoji: "🎒", image: "/stories/yaagvi-explorer/page-2.png", bg: "from-amber-400 to-orange-500" },
      { text: "Deep in the magical forest, she discovered a talking butterfly!", emoji: "🦋", image: "/stories/yaagvi-explorer/page-3.png", bg: "from-green-400 to-teal-500" },
      { text: "The butterfly showed her a hidden waterfall made of starlight!", emoji: "⭐", image: "/stories/yaagvi-explorer/page-4.png", bg: "from-blue-400 to-indigo-500" },
      { text: "Yaagvi wrote everything down in her magical adventure book.", emoji: "📚", image: "/stories/yaagvi-explorer/page-5.png", bg: "from-rose-400 to-pink-500" },
      { text: "She came home knowing tomorrow would bring another adventure! The End! 🌟", emoji: "🌙", image: "/stories/yaagvi-explorer/page-6.png", bg: "from-indigo-400 to-violet-600" },
    ]
  },
  {
    id: 5,
    title: "Yaagvi and the Moon Garden",
    emoji: "🌙",
    cover: "🌼",
    difficulty: 2,
    pages: [
      { text: "Yaagvi opened a tiny gate and found a garden glowing in moonlight.", emoji: "🌙", bg: "from-indigo-400 to-violet-600" },
      { text: "Silver flowers nodded softly when she said hello.", emoji: "🌼", bg: "from-purple-400 to-pink-500" },
      { text: "A little fox carried a lantern along the winding path.", emoji: "🦊", bg: "from-amber-400 to-orange-500" },
      { text: "The fox asked Yaagvi to count five bright stones.", emoji: "💎", bg: "from-sky-400 to-cyan-500" },
      { text: "Each stone lit up and made a gentle chime.", emoji: "🎵", bg: "from-teal-400 to-emerald-500" },
      { text: "Yaagvi smiled and promised to visit the moon garden again. The End!", emoji: "🌟", bg: "from-violet-400 to-purple-600" },
    ]
  },
  {
    id: 6,
    title: "The Lost Rainbow Train",
    emoji: "🚂",
    cover: "🌈",
    difficulty: 2,
    pages: [
      { text: "A rainbow train puffed into the station with no driver inside.", emoji: "🚂", bg: "from-red-400 to-yellow-400" },
      { text: "Yaagvi climbed aboard and found a map under the seat.", emoji: "🗺️", bg: "from-blue-400 to-indigo-500" },
      { text: "The train needed three magic tickets to move again.", emoji: "🎟️", bg: "from-pink-400 to-rose-500" },
      { text: "She found one by the clock, one by the bell, and one by the door.", emoji: "🔔", bg: "from-amber-400 to-orange-500" },
      { text: "The train whistled and rolled across a bridge of colours.", emoji: "🌈", bg: "from-green-400 to-teal-500" },
      { text: "Everyone cheered when the rainbow train reached home. The End!", emoji: "🎉", bg: "from-violet-400 to-purple-600" },
    ]
  },
  {
    id: 7,
    title: "Milo and the Kind Robot",
    emoji: "🤖",
    cover: "💡",
    difficulty: 3,
    pages: [
      { text: "Milo found a small robot sitting beside a broken wheel.", emoji: "🤖", bg: "from-slate-400 to-blue-500" },
      { text: "The robot could not speak, but its little light blinked slowly.", emoji: "💡", bg: "from-yellow-400 to-orange-500" },
      { text: "Milo listened carefully and saw that one tiny screw was missing.", emoji: "🔧", bg: "from-cyan-400 to-blue-500" },
      { text: "He searched the workshop and chose the smallest silver screw.", emoji: "⚙️", bg: "from-gray-400 to-slate-600" },
      { text: "The robot rolled forward and helped tidy every shelf.", emoji: "📚", bg: "from-green-400 to-emerald-500" },
      { text: "Milo learned that careful listening can solve big problems. The End!", emoji: "⭐", bg: "from-purple-400 to-indigo-600" },
    ]
  },
  {
    id: 8,
    title: "The Star Bakery",
    emoji: "🧁",
    cover: "⭐",
    difficulty: 3,
    pages: [
      { text: "At night, a tiny bakery opened above the clouds.", emoji: "🧁", bg: "from-pink-400 to-purple-500" },
      { text: "Yaagvi helped the baker mix flour, milk, and a pinch of stardust.", emoji: "🥣", bg: "from-amber-400 to-yellow-500" },
      { text: "The first cakes floated up before they were ready.", emoji: "🎈", bg: "from-sky-400 to-cyan-500" },
      { text: "Yaagvi read the recipe again and spotted the missing step.", emoji: "📖", bg: "from-violet-400 to-indigo-500" },
      { text: "They waited patiently until the cakes sparkled gold.", emoji: "✨", bg: "from-orange-400 to-rose-500" },
      { text: "The moon smiled as everyone shared warm star cakes. The End!", emoji: "🌙", bg: "from-indigo-400 to-purple-600" },
    ]
  },
]

// IPA for each phoneme — used when speaking the sound within a word
const STORY_PHONEME_IPA = {
  sh: 'ʃ', th: 'θ', ch: 'tʃ', qu: 'kw', ng: 'ŋ', nk: 'ŋk',
  ay: 'eɪ', ee: 'iː', igh: 'aɪ', ow: 'əʊ', oo: 'uː',
  ar: 'ɑː', or: 'ɔː', air: 'eə', ir: 'ɜː', ou: 'aʊ', oy: 'ɔɪ',
  ea: 'iː', oi: 'ɔɪ', ai: 'eɪ', oa: 'əʊ', aw: 'ɔː', ur: 'ɜː', er: 'ə',
}

// Reverse lookup: word → which phoneme it demonstrates
const WORD_PHONEME_MAP = new Map([
  // sh
  ...['ship','shop','shed','shelf','shell','shore','fish','dish','wish','fresh','flash','shout','shimmered','shining','shimmer'].map(w=>[w,'sh']),
  // th
  ...['thin','thick','bath','path','tooth','with','thing','thorn','thud','thump'].map(w=>[w,'th']),
  // ch
  ...['chip','chat','cheese','chain','chest','cheek','each','catch','match','bench','rich','lunch','child'].map(w=>[w,'ch']),
  // ng
  ...['ring','sing','king','wing','song','long','bang','hang','bring','sting','swing','strong','string','spring','young'].map(w=>[w,'ng']),
  // nk
  ...['sink','pink','drink','blink','bank','tank','trunk','skunk'].map(w=>[w,'nk']),
  // ay
  ...['play','day','say','way','clay','stay','tray','away'].map(w=>[w,'ay']),
  // ee
  ...['tree','bee','see','feet','seed','meet','need','keep','deep','sleep','feel','green','sweet','seen'].map(w=>[w,'ee']),
  // igh
  ...['light','night','right','fight','bright','might','sight','high','flight','knight'].map(w=>[w,'igh']),
  // ow (snow)
  ...['snow','blow','flow','glow','grow','show','slow','know','own','below','window','yellow','pillow'].map(w=>[w,'ow']),
  // oo
  ...['moon','pool','food','boot','zoo','cool','room','zoom','bloom','goose','spoon','school','stool'].map(w=>[w,'oo']),
  // ar
  ...['car','star','dark','park','farm','arm','art','start','shark','spark','yard'].map(w=>[w,'ar']),
  // or
  ...['door','floor','store','more','horn','corn','born','fort','sort','storm','short','sport','horse','torch'].map(w=>[w,'or']),
  // air
  ...['air','hair','fair','pair','chair','stair'].map(w=>[w,'air']),
  // ir
  ...['bird','girl','stir','firm','first','shirt','circle','twirl','swirl'].map(w=>[w,'ir']),
  // ou
  ...['shout','out','loud','found','round','sound','ground','mouth','cloud','proud','house','mouse'].map(w=>[w,'ou']),
  // oy
  ...['toy','boy','joy','enjoy','royal'].map(w=>[w,'oy']),
  // ea
  ...['tea','sea','read','bead','meal','seal','beat','heat','meat','seat','team','cream','dream','beach','reach','peach','leaf','bean','clean'].map(w=>[w,'ea']),
  // oi
  ...['coin','foil','soil','oil','boil','join','point','noise','voice','choice'].map(w=>[w,'oi']),
  // ai
  ...['rain','tail','nail','sail','mail','pain','brain','train','wait','snail','paint','trail'].map(w=>[w,'ai']),
  // oa
  ...['boat','coat','road','toad','foam','load','coal','soap','goat','toast','coast','float','groan'].map(w=>[w,'oa']),
  // aw
  ...['claw','draw','paw','straw','crawl','yawn','dawn','jaw','hawk'].map(w=>[w,'aw']),
  // ur
  ...['nurse','purse','fur','burn','turn','hurt','curl','turtle','purple'].map(w=>[w,'ur']),
  // er
  ...['letter','better','river','flower','over','under','silver','finger','sister','number','fern'].map(w=>[w,'er']),
])

function buildPhonicsWordSSML(word, phonemeKey) {
  const ipa = STORY_PHONEME_IPA[phonemeKey]
  if (!ipa) return null
  return `<prosody rate="-20%"><phoneme alphabet="ipa" ph="${ipa}">${phonemeKey}</phoneme></prosody><break time="300ms"/>${word}`
}

// RWI "red words" / tricky words — common exception words that don't follow regular phonics rules.
// Highlighted in red/orange so children know to remember them as whole words.
const TRICKY_WORDS = new Set([
  'the','to','was','said','of','his','has','i','you','they','are','we','my','her',
  'all','some','come','were','there','little','one','do','when','out','what','into',
  'go','no','so','he','she','me','be','have','like','by','our','day','made','came',
  'make','here','saw','put','love','your','once','upon','their','oh','could','looked',
  'very','would','should','called','asked','who','many','water','again','today',
])

// RWI-aligned phonics words kids can spot in stories.
// Organised by RWI Set so children recognise sounds they have been taught.
const PHONICS_WORDS = new Set([
  // Set 1 Special Friends — sh th ch qu ng nk
  'ship','shop','shed','shelf','shell','shore','fish','dish','wish','fresh','flash','shout',
  'thin','thick','bath','path','tooth','with','thing','thorn','thud','thump',
  'chip','chat','cheese','chain','chest','cheek','each','catch','match','bench','rich','lunch','child',
  'queen','quick','quiet','quite',
  'ring','sing','king','wing','song','long','bang','hang','bring','sting','swing','strong','string','spring','young',
  'sink','pink','drink','blink','bank','tank','trunk','skunk',
  // Set 2 Vowel Sounds — ay ee igh ow oo ar or air ir ou oy
  'play','day','say','way','clay','stay','tray','away',
  'tree','bee','see','feet','seed','meet','need','keep','deep','sleep','feel','green','sweet','seen',
  'light','night','right','fight','bright','might','sight','high','flight','knight',
  'snow','blow','flow','glow','grow','show','slow','know','own','below','window','yellow','pillow',
  'moon','pool','food','boot','zoo','cool','room','zoom','bloom','tooth','goose','spoon','school','stool',
  'car','star','dark','park','farm','arm','art','start','shark','spark','yard',
  'door','floor','store','more','horn','corn','born','fort','sort','storm','short','sport','horse','torch',
  'air','hair','fair','pair','chair','stair',
  'bird','girl','stir','firm','first','shirt','circle','twirl','swirl',
  'shout','out','loud','found','round','sound','ground','mouth','cloud','proud','house','mouse',
  'toy','boy','joy','enjoy','royal',
  // Set 3 Vowel Sounds — ea oi ai oa aw ur er
  'tea','sea','read','bead','meal','seal','beat','heat','meat','seat','team','cream','dream','beach','reach','peach','leaf','bean','clean',
  'coin','foil','soil','oil','boil','join','point','noise','voice','choice',
  'rain','tail','nail','sail','mail','pain','brain','train','wait','snail','paint','trail',
  'boat','coat','road','toad','foam','load','coal','soap','goat','toast','coast','float','groan',
  'claw','draw','paw','straw','crawl','yawn','dawn','jaw','hawk',
  'nurse','purse','fur','burn','turn','hurt','curl','turtle','purple',
  'letter','better','river','flower','over','under','silver','finger','sister','number','fern',
  // RWI Red Words
  'said','were','come','some','they','have','like','when','what','their','people','water',
  'every','could','would','should','many','again','because','once','always','want',
  'oh','there','little','one','do','so','the','to','no','go',
  'he','she','we','me','be','was','my','you','all','are',
  'of','put','push','pull','full','who','where','two','four',
])

function getStoryStats(progress = {}) {
  return progress.story?.storyStats || {}
}

function getStoryReadCount(progress, storyId) {
  return getStoryStats(progress)[storyId]?.readCount || 0
}

function getStoryDifficultyLabel(story) {
  const difficulty = story.difficulty || 1
  if (difficulty <= 1) return 'Easy'
  if (difficulty === 2) return 'Next step'
  return 'Challenge'
}

function getUnlockedStoryCount(progress = {}) {
  // Reading should never become unavailable because a child finished today's pick.
  // The recommendation rotates, while the complete library remains playable.
  return STORIES.length
}

function getCurrentRound(progress = {}) {
  return progress.story?.storyRound || 1
}

function isRoundComplete(progress = {}) {
  const round = getCurrentRound(progress)
  return STORIES.every(s => getStoryReadCount(progress, s.id) >= round)
}

function getRecommendedStories(stories, progress = {}) {
  const stats = getStoryStats(progress)
  const round = getCurrentRound(progress)
  // Shuffle ties (same readCount + difficulty) per round so repeat rounds
  // don't present the exact same 1-8 sequence as before.
  const shuffled = seededShuffle(stories, dailySeedFor(`storyroom-round-${round}`))
  return shuffled.sort((a, b) => {
    const aReads = stats[a.id]?.readCount || 0
    const bReads = stats[b.id]?.readCount || 0
    if (aReads !== bReads) return aReads - bReads
    return (a.difficulty || 1) - (b.difficulty || 1)
  })
}

export default function StoryRoom({ avatar, progress, onAddStars, onBack, profileName, onUpdateProgress }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak, stopSpeaking, speaking } = useSpeech()
  const [selectedStory, setSelectedStory] = useState(null)
  const [page, setPage] = useState(0)
  const [highlightedWord, setHighlightedWord] = useState(-1)
  const [autoPlay, setAutoPlay] = useState(false)
  const [showAllStories, setShowAllStories] = useState(false)
  const [foundPhonics, setFoundPhonics] = useState(new Set())
  const [tapFeedback, setTapFeedback] = useState(null)
  const autoRef = useRef(null)
  const timersRef = useRef([])
  const completedRef = useRef(false)
  const introSpokenRef = useRef(false)
  const recommendedStories = getRecommendedStories(STORIES, progress)
  const personalisedStory = useMemo(
    () => buildEarlyPersonalisedStory(progress, profileName),
    [progress, profileName],
  )

  // Count unique phonics words (non-tricky) on the current page — drives the mission target
  const pagePhonicsWords = useMemo(() => {
    if (!selectedStory) return new Set()
    return new Set(
      selectedStory.pages[page].text.split(' ')
        .map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase())
        .filter(clean => clean && PHONICS_WORDS.has(clean) && !TRICKY_WORDS.has(clean))
    )
  }, [selectedStory, page])

  const pagePhonicsTarget = pagePhonicsWords.size
  const pagePhonicsFound  = useMemo(
    () => [...pagePhonicsWords].filter(w => foundPhonics.has(w)).length,
    [pagePhonicsWords, foundPhonics]
  )
  const pageMissionDone = pagePhonicsTarget > 0 && pagePhonicsFound >= pagePhonicsTarget

  const clearStoryTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (autoRef.current) {
      clearTimeout(autoRef.current)
      autoRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearStoryTimers()
      stopSpeaking()
    }
  }, [clearStoryTimers, stopSpeaking])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearStoryTimers()
        setAutoPlay(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // On mount: set unlock start date, or advance to next round if this round is complete
  useEffect(() => {
    const story = progress.story || {}
    if (isRoundComplete(progress) && onUpdateProgress) {
      onUpdateProgress({
        story: {
          ...story,
          storyRound: (story.storyRound || 1) + 1,
          storyUnlockStart: new Date().toISOString(),
        },
      })
    } else if (!story.storyUnlockStart && onUpdateProgress) {
      onUpdateProgress({
        story: { ...story, storyUnlockStart: new Date().toISOString() },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentRound = getCurrentRound(progress)
  const unlockedCount = getUnlockedStoryCount(progress)
  const unlockedStories = recommendedStories.filter(s => s.id <= unlockedCount)
  const displayedStories = showAllStories ? unlockedStories : unlockedStories.slice(0, 3)
  const nextLockedStory = STORIES.find(s => s.id === unlockedCount + 1) || null
  const allRead = unlockedStories.every(s => getStoryReadCount(progress, s.id) >= currentRound)

  const readPage = useCallback((story, pageIdx) => {
    const pageData = story?.pages?.[pageIdx]
    if (!pageData) return
    const text = pageData.text
    const words = text.split(' ')

    clearStoryTimers()
    stopSpeaking()
    setHighlightedWord(-1)

    words.forEach((_, i) => {
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        setHighlightedWord(i)
      }, i * 380)
      timersRef.current.push(id)
    })

    speak(text, { mood: 'story' })

    const clearId = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== clearId)
      setHighlightedWord(-1)
    }, words.length * 380 + 500)
    timersRef.current.push(clearId)
  }, [clearStoryTimers, speak, stopSpeaking])

  const handleStorySelect = useCallback((story) => {
    clearStoryTimers()
    stopSpeaking()
    completedRef.current = false
    introSpokenRef.current = false
    setSelectedStory(story)
    setPage(0)
    setAutoPlay(false)
    setFoundPhonics(new Set())
    setTapFeedback(null)
    // Speak phonics-hunt intro before the page text so child knows the task
    if (!introSpokenRef.current) {
      introSpokenRef.current = true
      speakThenAdvance(speak,
        'Listen carefully! Can you find the special phonics words? Look for the underlined words and tap them to hear their sounds!',
        { mood: 'instruct', voice: 'gb' },
        () => readPage(story, 0),
        timersRef,
        { minMs: 1600, maxMs: 6500 }
      )
    }
  }, [clearStoryTimers, readPage, speak, stopSpeaking])

  const handleWordTap = useCallback((word, idx) => {
    const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
    const isPhonics = PHONICS_WORDS.has(clean)
    const isTricky = TRICKY_WORDS.has(clean)

    if (isTricky) {
      speak(`Tricky word — ${clean}! This one is special. Try to remember it.`, { rate: 0.85, voice: 'gb' })
    } else if (isPhonics) {
      const phonemeKey = WORD_PHONEME_MAP.get(clean)
      const ssml = phonemeKey ? buildPhonicsWordSSML(clean, phonemeKey) : null
      // Speak the phoneme sound first, then the word — so child hears the sound IN context
      speak(
        phonemeKey ? `${phonemeKey}… ${clean}` : clean,
        { rate: 0.8, voice: 'gb', ssmlInner: ssml }
      )
    } else {
      speak(clean, { rate: 0.8, voice: 'gb' })
    }

    setTapFeedback({ idx, correct: isPhonics, tricky: isTricky })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setTapFeedback(null)
    }, 1200)
    timersRef.current.push(id)
    // Tricky words don't count toward phonics score even if they're in PHONICS_WORDS
    if (isPhonics && !isTricky && !foundPhonics.has(clean)) {
      setFoundPhonics(prev => new Set([...prev, clean]))
    }
  }, [speak, foundPhonics])

  const nextPage = useCallback(() => {
    if (!selectedStory) return
    clearStoryTimers()
    stopSpeaking()
    if (page < selectedStory.pages.length - 1) {
      const next = page + 1
      setPage(next)
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        readPage(selectedStory, next)
      }, 400)
      timersRef.current.push(id)
    } else {
      if (completedRef.current) return
      completedRef.current = true
      const foundCount = foundPhonics.size
      speak(
        `The end. What a wonderful story. You are such a great reader, ${profileName || 'superstar'}. You spotted ${foundCount} phonics ${foundCount === 1 ? 'word' : 'words'}!`,
        { mood: 'celebrate' }
      )
      onAddStars('story', 3, {
        total: selectedStory.pages.length,
        correct: selectedStory.pages.length,
        struggles: [],
        storyId: selectedStory.id,
        storyTitle: selectedStory.title,
        storyDifficulty: selectedStory.difficulty || 1,
        phonicsFound: foundCount,
      })
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        setSelectedStory(null)
      }, 2000)
      timersRef.current.push(id)
    }
  }, [clearStoryTimers, selectedStory, page, readPage, speak, stopSpeaking, onAddStars, foundPhonics, profileName])

  const prevPage = useCallback(() => {
    if (page > 0) {
      clearStoryTimers()
      stopSpeaking()
      const prev = page - 1
      setPage(prev)
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        readPage(selectedStory, prev)
      }, 400)
      timersRef.current.push(id)
    }
  }, [clearStoryTimers, page, selectedStory, readPage, stopSpeaking])

  // Auto-play
  useEffect(() => {
    if (autoPlay && selectedStory) {
      autoRef.current = setTimeout(nextPage, selectedStory.pages[page].text.split(' ').length * 400 + 1500)
    }
    return () => clearTimeout(autoRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, page])

  // Story library
  if (!selectedStory) {
    return (
      <div className="min-h-screen pb-24" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center px-4 pt-safe pb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow mr-3"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <div className="flex items-center gap-2">
          <h1 className="font-bubble text-3xl shimmer-text">Story Room</h1>
          {currentRound >= 2 && (
            <span className="font-bubble text-sm px-2 py-1 rounded-full text-white"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
              ⭐ Round {currentRound}
            </span>
          )}
        </div>
        </div>
        <p className="font-round text-center opacity-70 mb-4 px-4" style={{ color: theme.text }}>
          {currentRound >= 2
            ? `Round ${currentRound} — every story is ready, with a fresh pick first! 🌟`
            : 'Every story is ready — choose one or follow today’s fresh pick! 📖'}
        </p>

        <div className="flex flex-col gap-4 px-4">
          <motion.button
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleStorySelect(personalisedStory)}
            className="relative overflow-hidden rounded-3xl p-4 text-left shadow-xl"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, border: '3px solid rgba(255,255,255,.7)' }}
          >
            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/20" />
            <div className="relative flex items-center gap-4">
              <img src="/yaagvi-3d-wave.png" alt="Yaagvi brings a story made for this explorer" className="h-20 w-20 object-contain drop-shadow-xl" />
              <div className="min-w-0 flex-1 text-white">
                <p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-white/80">Made from your learning journey</p>
                <span role="heading" aria-level="3" className="mt-1 block font-bubble text-xl">{personalisedStory.title}</span>
                <p className="mt-1 font-round text-xs font-bold text-white/80">A fresh {personalisedStory.frontierSkill} adventure starring {profileName || 'you'}</p>
              </div>
              <span className="text-2xl">▶</span>
            </div>
          </motion.button>

          {/* Unlocked stories */}
          {displayedStories.map((story, i) => {
            const readCount = getStoryReadCount(progress, story.id)
            const isRecommended = i === 0
            return (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStorySelect(story)}
                className="flex items-center gap-4 p-4 rounded-3xl shadow-lg text-left"
                style={{ background: theme.card, border: `2px solid ${isRecommended && !allRead ? theme.primary : theme.secondary}` }}
              >
                <div className="text-5xl w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                  {story.cover}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span role="heading" aria-level="3" className="font-bubble text-lg" style={{ color: theme.text }}>{story.title}</span>
                    {isRecommended && !allRead && (
                      <span className="font-round text-[10px] font-black uppercase tracking-[0.12em] rounded-full px-2 py-1 text-white"
                        style={{ background: theme.primary }}>
                        Next
                      </span>
                    )}
                  </div>
                  <p className="font-round text-sm opacity-60" style={{ color: theme.text }}>
                    {story.pages.length} pages • {story.emoji}
                  </p>
                  <p className="font-round text-xs mt-1 opacity-70" style={{ color: theme.text }}>
                    {getStoryDifficultyLabel(story)} • {readCount < currentRound ? 'New this round!' : `Read ${readCount}×`}
                  </p>
                </div>
                <span style={{ color: theme.primary }}>▶</span>
              </motion.button>
            )
          })}

          {unlockedStories.length > 3 && (
            <motion.button whileTap={{ scale: .97 }} onClick={() => setShowAllStories(value => !value)}
              className="rounded-2xl px-5 py-3 font-bubble text-sm"
              style={{ background:`${theme.primary}12`, color:theme.primary, border:`1.5px solid ${theme.primary}30` }}>
              {showAllStories ? 'Show just today’s picks' : `Explore all ${unlockedStories.length} stories`}
            </motion.button>
          )}

          {/* Next locked story teaser */}
          {nextLockedStory && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: displayedStories.length * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-3xl shadow-lg"
              style={{ background: theme.card, border: `2px dashed ${theme.secondary}`, opacity: 0.65 }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: `${theme.secondary}30` }}>
                🔒
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bubble text-lg" style={{ color: theme.text }}>{nextLockedStory.title}</p>
                <p className="font-round text-sm mt-0.5 opacity-60" style={{ color: theme.text }}>
                  Unlocks tomorrow — come back then! 🌅
                </p>
              </div>
            </motion.div>
          )}

          {/* Locked count hint when there are more beyond the teaser */}
          {STORIES.length - unlockedCount > 1 && (
            <p className="font-round text-center text-sm opacity-40 px-4 pb-2" style={{ color: theme.text }}>
              + {STORIES.length - unlockedCount - 1} more {STORIES.length - unlockedCount - 1 === 1 ? 'story' : 'stories'} on the way…
            </p>
          )}
        </div>
      </div>
    )
  }

  const currentPage = selectedStory.pages[page]
  const words = currentPage.text.split(' ')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { clearStoryTimers(); stopSpeaking(); setSelectedStory(null) }}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <div className="text-center">
          <h2 className="font-round text-xs font-bold" style={{ color: theme.text }}>{selectedStory.title}</h2>
          <div className="flex gap-1 justify-center mt-1">
            {selectedStory.pages.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === page ? theme.primary : theme.secondary }} />
            ))}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setAutoPlay(p => !p)}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: autoPlay ? theme.primary : theme.card, color: autoPlay ? 'white' : theme.text }}>
          {autoPlay ? '⏸' : '▶'}
        </motion.button>
      </div>

      {/* Story page */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          className="flex-1 mx-4 mt-2 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-[1.35fr_.85fr]"
          style={{ minHeight: 300 }}
        >
          {/* Animated scene illustration */}
          <div className={`bg-gradient-to-br ${currentPage.bg} flex flex-col items-center justify-center relative overflow-hidden`}
            style={{ minHeight: 360 }}>

            {/* Layered storybook stage — gives every page depth before its unique scene elements. */}
            <motion.div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-yellow-200/30 blur-sm"
              animate={{ scale:[1,1.12,1], opacity:[.35,.65,.35] }} transition={{duration:4,repeat:Infinity}} />
            <div className="absolute inset-x-0 bottom-0 h-[38%] rounded-[50%_50%_0_0/35%_35%_0_0] bg-emerald-700/15" />
            <div className="absolute -bottom-12 -left-10 h-44 w-[65%] rotate-3 rounded-[50%] bg-emerald-900/12" />
            <motion.div className="absolute bottom-[12%] left-[8%] text-3xl" animate={{x:[0,22,0],y:[0,-5,0]}} transition={{duration:5,repeat:Infinity}}>✨</motion.div>

            {/* Animated background scene elements */}
            <SceneLayer storyId={selectedStory.id} pageIdx={page} />

            {currentPage.image ? (
              <motion.img
                src={currentPage.image}
                alt={`Illustration for ${selectedStory.title}, page ${page + 1}`}
                className="absolute inset-0 h-full w-full object-contain"
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ zIndex: 1 }}
              />
            ) : <motion.div
              key={`emoji-${page}`}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-[120px] leading-none select-none relative drop-shadow-2xl"
              style={{ zIndex: 2 }}
              whileHover={{ scale: 1.08 }}
            >
              {currentPage.emoji}
            </motion.div>}
            <p className="font-round absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-white text-sm" style={{ zIndex: 3 }}>
              Page {page + 1} of {selectedStory.pages.length}
            </p>
          </div>

          {/* Text with word highlighting + phonics tap */}
          <div className="flex flex-col justify-center p-5 md:border-l" style={{ background: 'rgba(255,255,255,0.98)', borderColor:`${theme.primary}20` }}>

            {/* Mission banner — explicit goal + live progress */}
            <div className="rounded-2xl p-3 mb-3"
              style={{ background: pageMissionDone ? 'rgba(34,197,94,0.12)' : `${theme.primary}12`, border: `1.5px solid ${pageMissionDone ? '#22C55E50' : theme.primary + '40'}` }}>
              {/* Objective */}
              <p className="font-round text-xs font-bold mb-1.5"
                style={{ color: pageMissionDone ? '#16A34A' : theme.primary }}>
                {pageMissionDone ? '🌟 All phonics words found on this page!' : '🔍 Find the underlined phonics words — tap each one to hear its sound!'}
              </p>
              {/* Progress bar + count */}
              {pagePhonicsTarget > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(pagePhonicsFound / pagePhonicsTarget) * 100}%`, background: pageMissionDone ? '#22C55E' : theme.primary }} />
                  </div>
                  <span className="font-round text-xs font-bold shrink-0"
                    style={{ color: pageMissionDone ? '#16A34A' : theme.primary }}>
                    {pagePhonicsFound}/{pagePhonicsTarget} words
                  </span>
                </div>
              )}
              {/* Word type key */}
              <div className="flex items-center gap-3 mt-2">
                <span className="font-round text-xs px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ background: '#DC2626' }}>🔴 Remember it</span>
                <span className="font-round text-xs px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ background: theme.primary }}>🔵 Tap to hear the sound</span>
              </div>
            </div>
            <p className="font-round text-xl font-bold leading-[1.8] text-center" style={{ color: theme.text }}>
              {words.map((word, i) => {
                const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
                const isPhonics = PHONICS_WORDS.has(clean)
                const isTricky = TRICKY_WORDS.has(clean)
                const isFound = foundPhonics.has(clean)
                const isTapped = tapFeedback?.idx === i
                return (
                  <motion.span
                    key={i}
                    className="inline-block mx-0.5 px-1 rounded-md cursor-pointer select-none"
                    animate={
                      isTapped
                        ? { scale: 1.25, backgroundColor: tapFeedback.tricky ? '#FCA5A5' : tapFeedback.correct ? '#22C55E' : '#E5E7EB' }
                        : highlightedWord === i
                        ? { backgroundColor: theme.accent, color: 'white', scale: 1.1 }
                        : { backgroundColor: 'transparent', scale: 1 }
                    }
                    style={{
                      color: isTricky ? '#DC2626' : theme.text,
                      background: isTricky && !isTapped ? 'rgba(220,38,38,0.08)' : undefined,
                      border: isTricky ? '1px solid rgba(220,38,38,0.25)' : undefined,
                      borderRadius: isTricky ? '4px' : undefined,
                      textDecoration: isPhonics && !isTricky && !isFound ? 'underline dotted' : 'none',
                      textDecorationColor: theme.primary,
                      fontWeight: isPhonics || isTricky ? '800' : '700',
                      filter: isFound ? 'drop-shadow(0 0 4px #22C55E)' : 'none',
                    }}
                    onClick={() => handleWordTap(word, i)}
                  >
                    {isFound ? `${word} ✅` : word}
                  </motion.span>
                )
              })}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-4 mb-16">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={prevPage}
          disabled={page === 0}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl disabled:opacity-30"
          style={{ background: theme.card }}>
          ←
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => readPage(selectedStory, page)}
          className="flex-1 mx-4 py-3 rounded-2xl font-bubble text-white text-lg shadow-lg flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
          animate={speaking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, repeat: speaking ? Infinity : 0 }}
        >
          {speaking ? '🔊 Reading...' : '🔊 Read to Me'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={nextPage}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl font-bold"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: 'white' }}>
          {page === selectedStory.pages.length - 1 ? '🏠' : '→'}
        </motion.button>
      </div>
    </div>
  )
}
