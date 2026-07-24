import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'

// ── Story Data ────────────────────────────────────────────────────────────────
const RELIGIONS = [
  {
    id: 'hinduism',
    name: 'Hinduism',
    emoji: '🕉️',
    bg: 'linear-gradient(145deg,#C2410C,#F97316,#FED7AA)',
    color: '#EA580C',
    featured: true,
    desc: 'Ancient stories from India',
    stories: [
      {
        id: 'ganesha',
        title: 'Ganesha — The Elephant God',
        emoji: '🐘',
        tagline: 'Why Ganesha has an elephant head',
        panels: [
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '👩‍🎨', title: "A Mother's Love", text: "Long ago, Goddess Parvati wanted a child of her own. She shaped a boy from turmeric paste and breathed life into him. She named him Ganesha and loved him with all her heart!" },
          { bg: 'linear-gradient(180deg,#FEF3C7,#FDE68A)', emoji: '🚪', title: 'The Brave Guard', text: 'One day, Parvati asked Ganesha to guard the door while she bathed. "Let no one in," she said. Ganesha stood tall and proud, ready to protect his mother!' },
          { bg: 'linear-gradient(180deg,#FFEDD5,#FED7AA)', emoji: '⚡', title: 'A Big Misunderstanding', text: "Lord Shiva came home but did not know this boy! He tried to enter. Ganesha bravely blocked the way. They had a big fight — and poor Ganesha lost his head!" },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🐘', title: 'The Elephant Head', text: "Parvati was heartbroken. Shiva was sorry. He sent his helpers to find the first animal sleeping facing north — an elephant! Shiva placed the elephant's head on Ganesha, and he came back to life!" },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FED7AA)', emoji: '✨', title: 'Lord of New Beginnings', text: 'Shiva blessed Ganesha: "You will be the first god worshipped before anything new begins!" That is why we say "Jai Ganesha!" before starting school, a journey, or anything important.' },
        ],
        quiz: [
          { q: 'Who created Ganesha?', options: [{ text: 'Goddess Parvati 👩‍🎨', correct: true }, { text: 'Lord Shiva ⚡', correct: false }, { text: 'Lord Brahma 🌸', correct: false }] },
          { q: "What was placed on Ganesha's body?", options: [{ text: "A lion's head 🦁", correct: false }, { text: "An elephant's head 🐘", correct: true }, { text: "A tiger's head 🐯", correct: false }] },
          { q: 'When do we say "Jai Ganesha"?', options: [{ text: 'Before sleeping 💤', correct: false }, { text: 'Before anything new begins ✨', correct: true }, { text: 'Only at festivals 🎉', correct: false }] },
        ],
      },
      {
        id: 'krishna-butter',
        title: 'Krishna the Butter Thief',
        emoji: '🧈',
        tagline: 'The mischievous little god',
        panels: [
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '👶', title: 'Baby Krishna', text: "In the town of Vrindavan lived a mischievous baby named Krishna. He had big dark eyes, wore a peacock feather, and LOVED butter more than anything in the whole world!" },
          { bg: 'linear-gradient(180deg,#DBEAFE,#BFDBFE)', emoji: '🏺', title: 'The Hidden Pots', text: "His mother Yashoda hung the butter pots high on the ceiling so Krishna couldn't reach them. But clever Krishna was not going to give up that easily!" },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '👫', title: 'The Great Plan', text: "Krishna called his friends. They stood on top of each other to make a human tower! Up, up, up went Krishna — his little hand reached the pot. Then... SPLASH! Butter everywhere!" },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🐒', title: 'Sharing with Everyone', text: "Krishna didn't eat it all himself. He shared the butter with his friends AND the baby monkeys! He laughed and danced with butter all over his face — so full of joy!" },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '💛', title: 'A God Who Loves Fun', text: "Yashoda caught him but couldn't stay angry for long — Krishna's smile melted every heart! Krishna teaches us that God loves joy, laughter, and sharing with friends." },
        ],
        quiz: [
          { q: 'What did Krishna love to eat?', options: [{ text: 'Mangoes 🥭', correct: false }, { text: 'Butter 🧈', correct: true }, { text: 'Sweets 🍬', correct: false }] },
          { q: 'What did Krishna do with the butter?', options: [{ text: 'Ate it all alone 😶', correct: false }, { text: 'Shared it with friends 🤝', correct: true }, { text: 'Gave it back 😇', correct: false }] },
        ],
      },
      {
        id: 'hanuman',
        title: "Hanuman's Great Leap",
        emoji: '🐒',
        tagline: 'The brave monkey who flew across the ocean',
        panels: [
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '😢', title: 'Sita is Missing!', text: "The evil king Ravana had taken Princess Sita to his island of Lanka. Her husband, Prince Rama, was heartbroken. Who could cross the giant ocean to find her?" },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🐒', title: 'Brave Hanuman', text: 'Hanuman — the monkey god, son of the Wind — stepped forward. "I will go!" He climbed to the tallest mountain and looked out at the endless sea.' },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '💨', title: 'The Giant Leap', text: 'Hanuman took a deep breath, grew to an enormous size, and LEAPT! He flew across the sky like a comet, over mountains and oceans, all the way to Lanka!' },
          { bg: 'linear-gradient(180deg,#FEF3C7,#FDE68A)', emoji: '🪔', title: 'He Found Sita!', text: "In Ravana's garden, Hanuman found Sita under a tree, sad but brave. He gave her Rama's ring as proof. \"Rama is coming to save you,\" he whispered." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FED7AA)', emoji: '🙏', title: 'Devotion and Courage', text: 'Hanuman teaches us that with devotion, courage, and love — you can do the impossible! He is always remembered as the greatest devotee, full of strength and loyalty.' },
        ],
        quiz: [
          { q: 'Why did Hanuman leap across the ocean?', options: [{ text: 'To catch fish 🐟', correct: false }, { text: 'To find Sita 💛', correct: true }, { text: 'To fight Ravana 👹', correct: false }] },
          { q: 'What did Hanuman give Sita?', options: [{ text: 'A flower 🌸', correct: false }, { text: "Rama's ring 💍", correct: true }, { text: 'A letter 📜', correct: false }] },
        ],
      },
      {
        id: 'diwali',
        title: 'The Festival of Lights',
        emoji: '🪔',
        tagline: 'How Diwali began',
        panels: [
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '👑', title: 'Prince Rama', text: "Long ago, Prince Rama was kind, brave, and loved by everyone. But his stepmother tricked the king into sending Rama away to the forest for 14 years." },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🌲', title: 'Life in the Forest', text: "Rama went with his wife Sita and loyal brother Lakshmana. They lived simply in the forest. But the evil king Ravana kidnapped Sita and took her far away." },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '⚔️', title: 'The Great Battle', text: "Rama, helped by Hanuman and an army of brave monkeys, crossed the ocean and fought Ravana. Good fought evil — and GOOD WON!" },
          { bg: 'linear-gradient(180deg,#FEF3C7,#FDE68A)', emoji: '🪔', title: 'Welcome Home!', text: "When Rama, Sita, and Lakshmana returned after 14 years, the kingdom was overjoyed! People lit thousands of little clay lamps — diyas — to light their way home." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FEF9C3)', emoji: '✨', title: 'Let There Be Light!', text: "Every year we celebrate Diwali to remember that day! We light diyas, share sweets, and remember — light always wins over darkness, and good always wins over evil! 🎆" },
        ],
        quiz: [
          { q: 'Why were diyas lit for Diwali?', options: [{ text: 'To decorate the house 🏠', correct: false }, { text: 'To welcome Rama home 🪔', correct: true }, { text: 'Because it was dark 🌑', correct: false }] },
          { q: 'What does Diwali remind us?', options: [{ text: 'Good wins over evil ✨', correct: true }, { text: 'Sweets are yummy 🍬', correct: false }, { text: 'Monkeys are clever 🐒', correct: false }] },
        ],
      },
      {
        id: 'saraswati',
        title: 'Saraswati — Goddess of Learning',
        emoji: '🎵',
        tagline: 'The goddess who blesses students',
        panels: [
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '🌸', title: 'A Goddess of Beauty', text: "Goddess Saraswati sits on a white lotus, dressed in pure white. She has four arms, holds a veena, a book, and prayer beads. White swans and peacocks are always near her." },
          { bg: 'linear-gradient(180deg,#F0FDF4,#DCFCE7)', emoji: '📚', title: 'Goddess of Wisdom', text: "Saraswati is the goddess of knowledge, music, arts, and learning. Students pray to her before exams and when they need the courage to think clearly." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🎵', title: 'The Gift of Music', text: "She plays the veena so beautifully that even birds stop to listen. Music, she teaches us, is a language of the soul — it can make us feel things that words never can." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🦢', title: 'The White Swan', text: "Her white swan has a special power — it can separate milk from water! This teaches us wisdom: the ability to tell what is true from what is false, what is good from what is not." },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '✨', title: 'Pray Before You Learn', text: 'Before you open a book, take a moment and say a little prayer to Saraswati. She blesses all those who love learning. "Ya Devi Sarva Bhuteshu!" 🙏' },
        ],
        quiz: [
          { q: 'What is Saraswati the goddess of?', options: [{ text: 'Rain and rivers 🌊', correct: false }, { text: 'Knowledge and music 📚', correct: true }, { text: 'Food and harvest 🌾', correct: false }] },
          { q: "What does Saraswati's white swan teach us?", options: [{ text: 'How to swim 🏊', correct: false }, { text: 'To tell good from bad — wisdom 🦢', correct: true }, { text: 'To fly high 🦅', correct: false }] },
        ],
      },
      // ── New Mahabharata & festival stories ───────────────────────────────
      {
        id: 'arjuna',
        title: "Arjuna — Eyes on the Target",
        emoji: '🏹',
        tagline: 'The secret of perfect focus',
        panels: [
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🎓', title: 'Guru Dronacharya', text: "The great teacher Dronacharya was training princes in the art of archery. His students were among the best warriors in the land — but one stood above all others." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🌳', title: 'The Test', text: "Drona placed a wooden bird on a tree branch. He called each student one by one. \"Draw your bow and tell me — what do you see?\" he asked." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🤔', title: 'What Others Saw', text: "One said: \"I see the tree, the branch, the bird, the sky!\" Another said: \"I see the bird and the leaves!\" Drona asked each one to lower their bow. They had not passed." },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '🏹', title: "Arjuna's Answer", text: "Then came Arjuna. \"What do you see?\" asked Drona. \"Only the eye of the bird, Guruji. Nothing else.\" Drona smiled. \"Release!\" TWANG — the arrow hit perfectly!" },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🎯', title: 'The Lesson', text: "Arjuna's secret was focus. When you truly concentrate — you see only what matters. Whether it's your schoolwork, your sport, or your art — eyes on the target!" },
        ],
        quiz: [
          { q: 'What did Arjuna say he could see?', options: [{ text: 'The whole tree 🌳', correct: false }, { text: 'Only the eye of the bird 🏹', correct: true }, { text: 'The sky and clouds ☁️', correct: false }] },
          { q: "What was Arjuna's superpower?", options: [{ text: 'Running very fast 🏃', correct: false }, { text: 'Complete focus 🎯', correct: true }, { text: 'Super strength 💪', correct: false }] },
          { q: 'Who was the teacher?', options: [{ text: 'Guru Dronacharya 🎓', correct: true }, { text: 'Lord Krishna 🦚', correct: false }, { text: 'Lord Brahma 🌸', correct: false }] },
        ],
      },
      {
        id: 'krishna-gita',
        title: "Krishna's Big Lesson",
        emoji: '🦚',
        tagline: 'Do your best — the Bhagavad Gita',
        panels: [
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '⚔️', title: 'A Very Sad Arjuna', text: "The great battle of Kurukshetra was about to begin. But Arjuna put down his bow. \"I cannot fight,\" he cried. \"My own cousins are on the other side. What is the point of winning?\"" },
          { bg: 'linear-gradient(180deg,#FEF3C7,#FDE68A)', emoji: '🦚', title: 'Krishna Steps In', text: "His friend and guide Krishna sat beside him on the chariot. \"Arjuna,\" he said gently, \"I understand your sadness. But let me tell you something important.\"" },
          { bg: 'linear-gradient(180deg,#F0FDF4,#DCFCE7)', emoji: '🌟', title: 'Do Your Duty', text: "\"You are a warrior. A warrior's duty is to stand up for what is right. Do your very best — but do not be attached only to the result. Give everything you have!\"" },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🌸', title: 'The Soul Never Dies', text: "\"And remember,\" said Krishna, \"the soul — who you truly are — is eternal. It is never born and never dies. So fight bravely, with a peaceful heart.\"" },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '📖', title: 'The Gita for Us', text: "These words became the Bhagavad Gita — one of the most important books ever written. Its message for you: always try your very best and don't give up, whatever happens!" },
        ],
        quiz: [
          { q: 'Why was Arjuna sad at the start?', options: [{ text: 'He was tired 😴', correct: false }, { text: 'He had to fight his own cousins 😢', correct: true }, { text: 'He lost his bow 🏹', correct: false }] },
          { q: "What did Krishna tell Arjuna to do?", options: [{ text: 'Run away 🏃', correct: false }, { text: 'Do your duty and try your best 🌟', correct: true }, { text: 'Wait for someone to help 🤝', correct: false }] },
          { q: 'What is the Bhagavad Gita?', options: [{ text: "Krishna's important teaching 📖", correct: true }, { text: 'A recipe book 🍽️', correct: false }, { text: 'A map of India 🗺️', correct: false }] },
        ],
      },
      {
        id: 'prahlad',
        title: 'Prahlad and the Fire',
        emoji: '🔥',
        tagline: 'Why we celebrate Holi',
        panels: [
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '👹', title: 'The Demon King', text: "Long ago there was a powerful demon king named Hiranyakashipu. He was so proud that he wanted everyone to worship only HIM — not God. But his own little son Prahlad refused." },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '🙏', title: 'Prahlad Prays On', text: "Every single day, young Prahlad prayed to Lord Vishnu with his whole heart. \"Stop!\" commanded his father again and again. But Prahlad smiled peacefully and kept praying." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🔥', title: "Holika's Trap", text: "The king's sister Holika had a magical cloak that protected her from fire. She sat in a bonfire holding Prahlad, planning to burn him. But something amazing happened!" },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '✨', title: 'Faith Protects', text: "The fire blazed — but the cloak flew off Holika and wrapped around Prahlad instead! Prahlad walked out safe and cool. His deep faith had protected him completely." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FED7AA)', emoji: '🎨', title: 'Holi is Born!', text: "We celebrate Holi every year on that night — lighting bonfires to remember how goodness defeated evil. And the next day? We throw colours everywhere in pure joy! 🌈" },
        ],
        quiz: [
          { q: "Who was Prahlad's father?", options: [{ text: 'Lord Vishnu 🌟', correct: false }, { text: 'Demon king Hiranyakashipu 👹', correct: true }, { text: 'Lord Shiva ⚡', correct: false }] },
          { q: 'What did Prahlad do every day?', options: [{ text: 'Played in the garden 🌸', correct: false }, { text: 'Prayed to Lord Vishnu 🙏', correct: true }, { text: 'Trained as a warrior ⚔️', correct: false }] },
          { q: 'What festival reminds us of Prahlad?', options: [{ text: 'Diwali 🪔', correct: false }, { text: 'Holi 🎨', correct: true }, { text: 'Navratri 💃', correct: false }] },
        ],
      },
      {
        id: 'durga',
        title: 'Durga — The Warrior Goddess',
        emoji: '🦁',
        tagline: 'The goddess born from all their power',
        panels: [
          { bg: 'linear-gradient(180deg,#FDF2F8,#FCE7F3)', emoji: '👹', title: 'The Buffalo Demon', text: "A fearsome demon called Mahishasura had taken over the heavens! He could change his shape — from a buffalo to a man to any beast. No god could defeat him." },
          { bg: 'linear-gradient(180deg,#FEF3C7,#FDE68A)', emoji: '⚡', title: 'The Gods Unite', text: "Brahma, Vishnu, and Shiva put all their powers together. Beams of blazing light shot from each of them — and from that light, a magnificent goddess appeared!" },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🦁', title: 'Goddess Durga', text: "She had ten arms, each holding a different weapon — a trident, a sword, a bow, a discus! She rode a mighty lion. Her name was Durga — meaning \"the one who removes all evil.\"" },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '⚔️', title: 'Nine Days of Battle', text: "Durga fought the demon for nine days and nine nights — the most epic battle ever! She was fearless and unstoppable. On the tenth day, she defeated Mahishasura forever!" },
          { bg: 'linear-gradient(180deg,#FDF2F8,#FCE7F3)', emoji: '💃', title: 'Navratri!', text: "Every year we celebrate Navratri — nine nights of dancing and joy — to honour Goddess Durga. She teaches us: when we face hard things with courage and together, we can overcome anything!" },
        ],
        quiz: [
          { q: 'How many arms did Goddess Durga have?', options: [{ text: 'Two arms 💪', correct: false }, { text: 'Ten arms 🦁', correct: true }, { text: 'Four arms ✨', correct: false }] },
          { q: 'What animal did Durga ride?', options: [{ text: 'An elephant 🐘', correct: false }, { text: 'A tiger 🐯', correct: false }, { text: 'A lion 🦁', correct: true }] },
          { q: 'What festival celebrates Durga?', options: [{ text: 'Diwali 🪔', correct: false }, { text: 'Holi 🎨', correct: false }, { text: 'Navratri 💃', correct: true }] },
        ],
      },
      {
        id: 'ganesh-moon',
        title: 'Ganesh and the Naughty Moon',
        emoji: '🌙',
        tagline: 'Why we skip the moon on Ganesh Chaturthi',
        panels: [
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🎂', title: "Ganesh's Special Day", text: "It was Ganesh Chaturthi — Lord Ganesha's birthday! Everyone had given him sweets and modaks all day. His big tummy was very, VERY full by the time evening came." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🐭', title: 'The Tiny Mouse', text: "Ganesha climbed onto his tiny mouse vehicle to ride home. But the mouse was small, Ganesha's tummy was huge, and the path was dark. The mouse tripped on a snake!" },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '💥', title: 'CRASH!', text: "Ganesha tumbled off! He fell to the ground with a big THUD — and all the modaks and sweets rolled everywhere. Poor Ganesha! He quickly tucked the snake back as a belt." },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '🌙', title: 'The Moon Laughed', text: "Up in the sky, the Moon looked down and burst into laughter. \"HA HA HA! Look at fat Ganesha fall!\" he giggled. Ganesha looked up, and his eyes turned serious." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FED7AA)', emoji: '🙅', title: "Ganesha's Curse", text: "\"Moon,\" said Ganesha, \"you laughed at someone's difficulty. On my birthday, anyone who looks at you will be wrongly blamed for something they didn't do!\" That is why we don't look at the moon on Ganesh Chaturthi!" },
        ],
        quiz: [
          { q: 'Why did Ganesha fall?', options: [{ text: 'He was pushed 😤', correct: false }, { text: 'His mouse tripped on a snake 🐭', correct: true }, { text: 'He was dancing 💃', correct: false }] },
          { q: 'What did the Moon do wrong?', options: [{ text: 'Hid from Ganesha 🌑', correct: false }, { text: 'Laughed at Ganesha falling 😂', correct: true }, { text: 'Stole his sweets 🍬', correct: false }] },
          { q: "What happens if you look at the moon on Ganesh Chaturthi?", options: [{ text: 'You get a wish 🌟', correct: false }, { text: 'You may be blamed for something you didn\'t do ⚠️', correct: true }, { text: 'You turn into a frog 🐸', correct: false }] },
        ],
      },
    ],
  },
  {
    id: 'christianity',
    name: 'Christianity',
    emoji: '✝️',
    bg: 'linear-gradient(145deg,#1D4ED8,#3B82F6,#93C5FD)',
    color: '#1D4ED8',
    desc: 'Stories of faith and love',
    stories: [
      {
        id: 'noah',
        title: "Noah and the Big Boat",
        emoji: '🚢',
        tagline: 'The rainbow promise',
        panels: [
          { bg: 'linear-gradient(180deg,#F0F9FF,#E0F2FE)', emoji: '🌧️', title: 'A Very Rainy Plan', text: "God told a good man named Noah: \"I will send rain. Build a big boat — an ark — and bring your family and two of every animal!\" Noah trusted God and got to work." },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🦁🐘🐧', title: 'The Animals Come!', text: "Noah built the giant ark. Then came the animals — two by two! Lions, elephants, giraffes, penguins, rabbits, and every creature you can imagine. In they went!" },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '⛈️', title: 'Forty Days of Rain', text: "The rain poured and poured for 40 days and 40 nights! The whole world was covered with water. But Noah's ark floated safely, keeping everyone warm and dry inside." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🕊️', title: 'The Dove Returns', text: "Noah sent a dove to look for land. The dove came back with an olive branch! That meant dry land was near. They had survived the great flood!" },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🌈', title: 'A Promise in the Sky', text: "God put a beautiful rainbow in the sky as a promise: \"I will always love and care for the world.\" Even today, when you see a rainbow — it is a sign of hope and love!" },
        ],
        quiz: [
          { q: 'What did Noah build?', options: [{ text: 'A house 🏠', correct: false }, { text: 'A big boat — the Ark 🚢', correct: true }, { text: 'A bridge 🌉', correct: false }] },
          { q: 'What did the rainbow mean?', options: [{ text: 'More rain is coming 🌧️', correct: false }, { text: "God's promise of love 🌈", correct: true }, { text: 'Time to go fishing 🐟', correct: false }] },
        ],
      },
      {
        id: 'david',
        title: 'David and the Giant',
        emoji: '🗡️',
        tagline: 'Small but mighty',
        panels: [
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '👦', title: 'The Little Shepherd', text: "David was a young shepherd boy who looked after his father's sheep. He was small, but he had a brave heart and trusted in God completely." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '👹', title: 'The Giant Goliath', text: "A massive warrior named Goliath shouted: \"Send me your best fighter!\" He was nearly 3 metres tall with heavy armour. Everyone was terrified — except David." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🪨', title: 'David Steps Forward', text: "\"I will fight him!\" said young David. Everyone laughed. But David picked up five smooth stones from the river and walked forward with his sling." },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '⭐', title: 'One Perfect Stone', text: "David swung his sling — WHOOSH — the stone flew and struck Goliath right on the forehead. The giant crashed to the ground. The little shepherd had won!" },
          { bg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE)', emoji: '💪', title: 'Courage Over Size', text: "David teaches us that size doesn't matter — courage and faith do. You don't have to be the biggest or strongest. A brave heart can do amazing things!" },
        ],
        quiz: [
          { q: 'What job did David have?', options: [{ text: 'A soldier ⚔️', correct: false }, { text: 'A shepherd 🐑', correct: true }, { text: 'A prince 👑', correct: false }] },
          { q: 'What did David use to defeat Goliath?', options: [{ text: 'A big sword ⚔️', correct: false }, { text: 'A stone in a sling 🪨', correct: true }, { text: 'His bare hands ✊', correct: false }] },
        ],
      },
    ],
  },
  {
    id: 'islam',
    name: 'Islam',
    emoji: '☪️',
    bg: 'linear-gradient(145deg,#15803D,#22C55E,#86EFAC)',
    color: '#15803D',
    desc: 'Stories of faith and kindness',
    stories: [
      {
        id: 'ibrahim',
        title: 'Ibrahim and the Stars',
        emoji: '⭐',
        tagline: 'Searching for the truth',
        panels: [
          { bg: 'linear-gradient(180deg,#F0FDF4,#DCFCE7)', emoji: '🌙', title: 'A Curious Boy', text: "Long ago, a boy named Ibrahim looked up at the sky full of stars and wondered: \"Who made all this?\" He searched for the truth with an open and questioning heart." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '⭐', title: 'Not the Star', text: "Ibrahim saw a bright star rise. \"Could this be God?\" Then it set. \"If it goes away, it cannot be God,\" he said. He kept thinking and searching for the answer." },
          { bg: 'linear-gradient(180deg,#F0F9FF,#E0F2FE)', emoji: '🌙', title: 'Not the Moon', text: "The moon rose, big and beautiful. \"Is this God?\" But when morning came, the moon disappeared. Ibrahim said: \"No, my God never disappears.\"" },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '☀️', title: 'Not the Sun', text: "The bright sun rose in glory. \"Surely this must be God!\" But as the sun set, Ibrahim understood — the true God made the sun, moon, and stars. God is always there!" },
          { bg: 'linear-gradient(180deg,#F0FDF4,#DCFCE7)', emoji: '🌟', title: 'The One God', text: "Ibrahim found the truth: one God created everything and is always present. This faith made him one of the most beloved prophets. His story teaches us to always seek the truth!" },
        ],
        quiz: [
          { q: 'What was Ibrahim searching for?', options: [{ text: 'Treasure 💰', correct: false }, { text: 'The true God 🌟', correct: true }, { text: 'His family 👨‍👩‍👧', correct: false }] },
          { q: "Why wasn't the star Ibrahim's God?", options: [{ text: 'It was too small ✨', correct: false }, { text: "It disappeared — God never sets 🌙", correct: true }, { text: 'It was too bright ☀️', correct: false }] },
        ],
      },
      {
        id: 'kind-prophet',
        title: 'The Gift of Kindness',
        emoji: '🌹',
        tagline: 'Being kind even when others are not',
        panels: [
          { bg: 'linear-gradient(180deg,#F0FDF4,#DCFCE7)', emoji: '🚶', title: 'The Daily Walk', text: "Every day, the Prophet Muhammad would walk through the streets. And every day, an old woman would throw rubbish on him from her window. Every single day." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🗑️', title: 'Never Angry', text: "The Prophet never got angry. He never shouted or complained. He just walked on with a smile. His friends were amazed — \"How do you stay so calm?\" they asked." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🤔', title: 'A Quiet Day', text: "One day, there was no rubbish. The Prophet stopped — he was worried! He went upstairs and knocked on the old woman's door to check on her." },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🏥', title: 'She Was Ill', text: "The old woman was sick in bed. She was shocked — the very person she had hurt had come to help her! The Prophet sat with her, brought food, and took care of her." },
          { bg: 'linear-gradient(180deg,#F0FDF4,#DCFCE7)', emoji: '💚', title: 'Kindness Wins', text: "The old woman cried. \"Who are you?\" \"I am Muhammad.\" Kindness without expecting anything back — that is the most powerful thing in the world." },
        ],
        quiz: [
          { q: 'What did the old woman do every day?', options: [{ text: 'Wave hello 👋', correct: false }, { text: 'Throw rubbish 🗑️', correct: true }, { text: 'Bring food 🍲', correct: false }] },
          { q: 'Why did the Prophet visit the woman?', options: [{ text: 'To tell her off 😠', correct: false }, { text: 'He was worried she was ill 🏥', correct: true }, { text: 'She invited him 💌', correct: false }] },
        ],
      },
    ],
  },
  {
    id: 'buddhism',
    name: 'Buddhism',
    emoji: '☸️',
    bg: 'linear-gradient(145deg,#92400E,#D97706,#FCD34D)',
    color: '#92400E',
    desc: 'Stories of peace and wisdom',
    stories: [
      {
        id: 'siddhartha',
        title: 'The Prince Who Asked Why',
        emoji: '🧘',
        tagline: 'How the Buddha found peace',
        panels: [
          { bg: 'linear-gradient(180deg,#FFFBEB,#FEF3C7)', emoji: '👑', title: 'A Prince in a Palace', text: "Long ago in India, a prince named Siddhartha lived in a beautiful palace. He had everything — fine food, music, gardens. His father kept him away from the outside world." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🚶', title: 'Beyond the Walls', text: "One day, Siddhartha rode out of the palace. He saw an old man bent with age, a sick man in pain, and someone who had died. \"Why do people suffer?\" he asked." },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '🧘', title: 'The Peaceful Monk', text: "Then he saw a monk walking calmly with a peaceful smile. \"Who is that?\" \"Someone who has found peace.\" Siddhartha's heart was moved. He left to find the answer." },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🌳', title: 'Under the Bodhi Tree', text: "Siddhartha sat under a great tree and meditated deeply for many days. He did not give up. And one day, he understood everything. He became the Buddha — the Awakened One!" },
          { bg: 'linear-gradient(180deg,#FFFBEB,#FEF3C7)', emoji: '☮️', title: 'His Message: Be Kind', text: "Buddha shared what he learned: be kind, be peaceful, let go of anger, and help others. Every person, no matter how small, deserves kindness. His teachings spread across the world!" },
        ],
        quiz: [
          { q: 'What question troubled Siddhartha?', options: [{ text: 'Where is the treasure? 💰', correct: false }, { text: 'Why do people suffer? 😢', correct: true }, { text: 'How to be a king? 👑', correct: false }] },
          { q: "What is the Buddha's main teaching?", options: [{ text: 'Win every fight 💪', correct: false }, { text: 'Be kind and peaceful ☮️', correct: true }, { text: 'Eat as much as you can 🍽️', correct: false }] },
        ],
      },
      {
        id: 'angry-man',
        title: "Don't Accept Anger",
        emoji: '😤',
        tagline: "The Buddha's clever lesson",
        panels: [
          { bg: 'linear-gradient(180deg,#FFFBEB,#FEF3C7)', emoji: '😠', title: 'A Very Angry Man', text: "One day, an angry man marched up to the Buddha and started shouting terrible things at him. His face was red with fury. The crowd watched quietly." },
          { bg: 'linear-gradient(180deg,#FFF7ED,#FFEDD5)', emoji: '🧘', title: 'The Buddha Just Smiled', text: "The Buddha sat calmly and listened. He did not shout back. He just smiled gently. This made the angry man even MORE furious! \"Why don't you fight back?!\"" },
          { bg: 'linear-gradient(180deg,#FEF9C3,#FEF08A)', emoji: '🎁', title: 'A Question About Gifts', text: "The Buddha asked softly: \"If someone offers you a gift and you say no thank you — who does the gift belong to?\" The man thought carefully." },
          { bg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', emoji: '💡', title: 'The Lesson', text: '"To the person who offered it," said the man. "Exactly," said the Buddha. "You offered me your anger. I do not accept it. So it stays with you." The man went very quiet.' },
          { bg: 'linear-gradient(180deg,#FFFBEB,#FEF3C7)', emoji: '☮️', title: 'Anger is a Choice', text: "The man felt ashamed — but also free. We CHOOSE to accept anger or let it go. You cannot hurt someone who is at peace. This is the wisdom of the Buddha." },
        ],
        quiz: [
          { q: 'What did Buddha do when the man shouted?', options: [{ text: 'Shouted back 😠', correct: false }, { text: 'Stayed calm and smiled 🧘', correct: true }, { text: 'Ran away 🏃', correct: false }] },
          { q: "What did Buddha teach about anger?", options: [{ text: 'Always show your anger 😤', correct: false }, { text: "You can choose not to accept it ☮️", correct: true }, { text: 'Anger makes you strong 💪', correct: false }] },
        ],
      },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function StarRow({ count, size = 28 }) {
  return (
    <div className="flex gap-1 justify-center">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: i < count ? 1 : 0.4, rotate: 0 }}
          transition={{ delay: i * 0.15, type: 'spring', stiffness: 400 }}
          style={{ fontSize: size, opacity: i < count ? 1 : 0.25 }}
        >⭐</motion.span>
      ))}
    </div>
  )
}

function CompletedBadge() {
  return (
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md z-10"
      style={{ background: '#10B981', color: 'white' }}
    >✓</motion.div>
  )
}

// ── Screens ───────────────────────────────────────────────────────────────────
function HomeScreen({ theme, onBack, onSelect, completed }) {
  const featured = RELIGIONS[0]
  const others = RELIGIONS.slice(1)

  const countDone = (religion) =>
    religion.stories.filter(s => completed.includes(s.id)).length

  const featuredDone = countDone(featured)
  const featuredTotal = featured.stories.length
  const allDone = RELIGIONS.reduce((sum, r) => sum + countDone(r), 0)
  const allTotal = RELIGIONS.reduce((sum, r) => sum + r.stories.length, 0)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--theme-bg)' }}>
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3">
        <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: `${theme.primary}22` }}>‹</motion.button>
        <div className="flex-1">
          <h1 className="font-bubble text-2xl" style={{ color: theme.primary }}>Sacred Stories</h1>
          <p className="font-round text-xs text-gray-400">Stories from around the world</p>
        </div>
        {allDone > 0 && (
          <div className="flex flex-col items-center px-2 py-1 rounded-xl" style={{ background: `${theme.primary}15` }}>
            <span className="font-bubble text-sm" style={{ color: theme.primary }}>{allDone}/{allTotal}</span>
            <span className="font-round text-gray-400" style={{ fontSize: 9 }}>read</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {/* Featured: Hinduism */}
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(featured.id)}
          aria-label={`${featured.name}: ${featuredDone > 0 ? `${featuredDone} of ${featuredTotal} stories completed` : `${featuredTotal} stories`}`}
          className="w-full rounded-3xl overflow-hidden relative"
          style={{ background: featured.bg, minHeight: 160 }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%)' }} />
          <div className="relative p-5 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-round">⭐ Featured</span>
              {featuredDone > 0 && (
                <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-round">
                  {featuredDone}/{featuredTotal} done
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 52 }}>{featured.emoji}</span>
              <div className="text-left">
                <h3 className="font-bubble text-white text-2xl leading-tight">{featured.name}</h3>
                <p className="font-round text-white/80 text-sm">{featured.desc}</p>
                <p className="font-round text-white/70 text-xs mt-1">{featuredTotal} stories inside</p>
              </div>
            </div>
            {featuredDone > 0 && (
              <div className="w-full mt-1">
                <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.25)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'rgba(255,255,255,0.85)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(featuredDone / featuredTotal) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.button>

        <p className="font-round text-xs text-gray-400 px-1">More religions</p>
        <div className="grid grid-cols-3 gap-3">
          {others.map((r, i) => {
            const done = countDone(r)
            const total = r.stories.length
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => onSelect(r.id)}
                aria-label={`${r.name}: ${done > 0 ? `${done} of ${total} stories completed` : `${total} stories`}`}
                className="rounded-2xl overflow-hidden relative flex flex-col items-center justify-center gap-1.5 py-4"
                style={{ background: r.bg, minHeight: 100 }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%)' }} />
                {done === total && total > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10"
                    style={{ background: '#10B981', color: 'white' }}>✓</div>
                )}
                <span className="relative" style={{ fontSize: 30 }}>{r.emoji}</span>
                <h3 className="relative font-bubble text-white text-sm leading-tight text-center px-1">{r.name}</h3>
                <p className="relative font-round text-white/70" style={{ fontSize: 10 }}>
                  {done > 0 ? `${done}/${total} done` : `${total} stories`}
                </p>
              </motion.button>
            )
          })}
        </div>

        <div className="rounded-2xl p-3 flex gap-2 items-start" style={{ background: `${theme.primary}12` }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <p className="font-round text-xs" style={{ color: theme.primary }}>
            Tap a story, swipe or tap through the panels, then answer the quiz to earn stars!
          </p>
        </div>
      </div>
    </div>
  )
}

function ReligionScreen({ religion, theme, onBack, onSelect, completed }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--theme-bg)' }}>
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3">
        <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: `${theme.primary}22` }}>‹</motion.button>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 28 }}>{religion.emoji}</span>
          <div>
            <h1 className="font-bubble text-xl" style={{ color: theme.primary }}>{religion.name}</h1>
            <p className="font-round text-xs text-gray-400">{religion.desc}</p>
          </div>
        </div>
        <div className="ml-auto font-round text-xs text-gray-400">
          {religion.stories.filter(s => completed.includes(s.id)).length}/{religion.stories.length} done
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
        <p className="font-round text-xs text-gray-400 px-1">Choose a story</p>
        {religion.stories.map((story, i) => {
          const isDone = completed.includes(story.id)
          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(story.id)}
              aria-label={`${story.title}${isDone ? ', completed' : ''}. ${story.panels.length} panels, ${story.quiz.length} questions`}
              className="w-full rounded-2xl p-4 flex items-center gap-3 text-left relative overflow-hidden"
              style={{ background: religion.bg }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)' }} />
              {isDone && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow"
                  style={{ background: '#10B981', color: 'white' }}>✓</div>
              )}
              <span className="relative flex-shrink-0" style={{ fontSize: 38 }}>{story.emoji}</span>
              <div className="relative flex-1 pr-6">
                <h3 className="font-bubble text-white text-base leading-tight">{story.title}</h3>
                <p className="font-round text-white/75 text-xs mt-0.5">{story.tagline}</p>
                <p className="font-round text-white/60 mt-1" style={{ fontSize: 10 }}>
                  {story.panels.length} panels · {story.quiz.length} questions
                  {isDone ? ' · ✅ Completed!' : ''}
                </p>
              </div>
              <span className="relative text-white/60 text-lg">›</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function StoryScreen({ story, panel, panelIdx, theme, onBack, onNext, displayText }) {
  const touchStart = useRef(null)

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (diff > 40) onNext()
    touchStart.current = null
  }

  const total = story.panels.length
  const isLast = panelIdx === total - 1

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: panel.bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-safe" style={{ paddingTop: 12 }}>
        {story.panels.map((_, i) => (
          <div key={i} className="flex-1 rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(0,0,0,0.15)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'rgba(0,0,0,0.55)' }}
              initial={{ width: i < panelIdx ? '100%' : '0%' }}
              animate={{ width: i <= panelIdx ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      <div className="absolute left-3 z-10" style={{ top: 28 }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.15)' }}>
          <span className="text-white text-lg font-bold">‹</span>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={panelIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22 }}
          className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-6 gap-4"
        >
          <motion.span
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            style={{ fontSize: 80, lineHeight: 1 }}
          >{panel.emoji}</motion.span>

          <div className="text-center max-w-sm">
          <motion.h2
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="font-bubble text-xl mb-2"
              style={{ color: 'rgba(0,0,0,0.75)' }}
          >{panel.title}</motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="font-round text-base leading-relaxed"
              style={{ color: 'rgba(0,0,0,0.65)' }}
            >{displayText ?? panel.text}</motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="px-6 pb-safe pb-8 flex flex-col items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onNext}
          className="w-full max-w-xs py-4 rounded-2xl font-bubble text-lg text-white shadow-lg"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
        >
          {isLast ? '✨ Answer Questions!' : 'Next →'}
        </motion.button>
        <p className="font-round text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
          {panelIdx + 1} of {total} · or swipe left
        </p>
      </div>
    </div>
  )
}

function QuizScreen({ question, quizIdx, total, selectedOption, theme, onAnswer, onBack }) {
  if (!question) return null
  return (
    <div className="min-h-screen flex flex-col px-4 pt-safe pt-4 pb-8" style={{ background: 'var(--theme-bg)' }}>
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: `${theme.primary}22` }}>‹</motion.button>
        <div className="flex-1">
          <p className="font-round text-xs text-gray-400">Question {quizIdx + 1} of {total}</p>
          <div className="mt-1 h-2 rounded-full overflow-hidden" style={{ background: `${theme.primary}22` }}>
            <motion.div className="h-full rounded-full" style={{ background: theme.primary }}
              animate={{ width: `${((quizIdx + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <motion.div
        key={quizIdx}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center gap-6"
      >
        <div className="rounded-3xl p-6 text-center" style={{ background: `${theme.primary}15` }}>
          <span style={{ fontSize: 44 }}>🤔</span>
          <p className="font-bubble text-xl mt-3" style={{ color: theme.primary }}>{question.q}</p>
        </div>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => {
            const chosen = selectedOption === opt
            const correct = opt.correct
            let bg = `${theme.primary}18`
            let border = 'transparent'
            let textColor = theme.primary
            if (selectedOption) {
              if (correct && chosen) { bg = '#D1FAE5'; border = '#10B981'; textColor = '#065F46' }
              else if (chosen) { bg = '#FEE2E2'; border = '#EF4444'; textColor = '#991B1B' }
            }
            return (
              <motion.button
                key={i}
                data-companion-answer={correct ? 'correct' : 'wrong'}
                whileTap={{ scale: selectedOption ? 1 : 0.97 }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => onAnswer(opt)}
                className="w-full py-4 px-5 rounded-2xl text-left font-round text-base font-bold"
                style={{ background: bg, border: `2px solid ${border}`, color: textColor }}
              >
                <span className="mr-2">{['A', 'B', 'C'][i]}.</span>{opt.text}
                {selectedOption && chosen && correct && <span className="float-right">✅</span>}
                {selectedOption && chosen && !correct && <span className="float-right">❌</span>}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function CompleteScreen({ story, stars, isFirstTime, theme, onDone, profileName }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 text-center" style={{ background: 'var(--theme-bg)' }}>
      <motion.span
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        style={{ fontSize: 80 }}
      >{story.emoji}</motion.span>

      <div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="font-bubble text-3xl" style={{ color: theme.primary }}>
          Well done, {profileName}! 🎉
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-round text-gray-500 mt-1">
          You finished "{story.title}"
        </motion.p>
        {isFirstTime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-round text-sm font-bold"
            style={{ background: '#D1FAE5', color: '#065F46' }}
          >
            ✓ Story Completed!
          </motion.div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <StarRow count={stars} size={36} />
        <p className="font-round text-sm text-gray-400 mt-2">
          {stars === 3 ? '🏆 Perfect score!' : stars === 2 ? '🌟 Great job!' : '👍 Keep reading!'}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDone}
        className="w-full max-w-xs py-4 rounded-2xl font-bubble text-xl text-white shadow-lg"
        style={{ background: `linear-gradient(135deg,${theme.primary},${theme.secondary || theme.primary})` }}
      >
        Read Another Story 📖
      </motion.button>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
// Phonetic hints for names a neural voice may mispronounce
const SACRED_PRONUNCIATION = {
  // Hindu names — main deities
  Ganesha:         'Gah-nay-shah',
  Parvati:         'Pahr-vah-tee',
  Shiva:           'Shee-vah',
  Krishna:         'Krish-nah',
  Yashoda:         'Yah-show-dah',
  Vrindavan:       'Vrin-dah-van',
  Hanuman:         'Hah-noo-mahn',
  Ravana:          'Rah-vah-nah',
  Lakshmana:       'Lahksh-muh-nah',
  Saraswati:       'Sah-ras-wah-tee',
  Brahma:          'Brah-mah',
  Vishnu:          'Vish-noo',
  Durga:           'Door-gah',
  Arjuna:          'Ar-joo-nah',
  Dronacharya:     'Droh-nah-char-yah',
  Hiranyakashipu:  'Hir-un-yah-kash-ee-poo',
  Holika:          'Hoh-lee-kah',
  Prahlad:         'Prah-laad',
  Mahishasura:     'Mah-hish-ah-soo-rah',
  Kurukshetra:     'Koo-rook-sheh-trah',
  Bhagavad:        'Bah-guh-vahd',
  Navratri:        'Nav-rah-tree',
  Chaturthi:       'Chah-toor-thee',
  Diwali:          'Dee-vah-lee',
  Modak:           'Moh-dak',
  Lanka:           'Lan-kah',
  // Islamic names
  Ibrahim:         'Ib-rah-heem',
  Muhammad:        'Moo-ham-mad',
  // Buddhist names
  Siddhartha:      'Sid-ar-tah',
  // Jewish names
  Sukkot:          'Soo-kot',
  Chanukah:        'Hah-noo-kah',
  Hanukkah:        'Hah-noo-kah',
}

function sacredPreprocess(text) {
  let t = text
  for (const [name, hint] of Object.entries(SACRED_PRONUNCIATION)) {
    t = t.replace(new RegExp(`\\b${name}\\b`, 'g'), hint)
  }
  return t
}

// For EYFS (3–4): keep only the first two sentences so content stays concrete
function eyfsShorten(text) {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [text]
  return sentences.slice(0, 2).join('').trim()
}

// Fully rewritten panel text for 3–4 year olds — concrete vocabulary, short sentences
const TODDLER_PANELS = {
  'ganesha': [
    "A kind goddess called Parvati wanted a baby. She made a boy from clay and he came to life! She named him Ganesha.",
    "Parvati asked Ganesha to stand at the door. \"Do not let anyone in!\" she said. Ganesha stood up tall and brave.",
    "A big god called Shiva came to the door. He did not know Ganesha! They had a big fight and Ganesha got very hurt.",
    "Parvati was very sad. Shiva was sorry. He put an elephant's head on Ganesha — and Ganesha came back to life!",
    "Shiva gave Ganesha a special job. \"People will say hello to you first!\" So we say Jai Ganesha before anything new.",
  ],
  'krishna-butter': [
    "A little boy called Krishna loved butter more than anything! He had big dark eyes and wore a peacock feather.",
    "His mum put the butter pots up high so Krishna could not reach them. But clever Krishna had a plan!",
    "Krishna called his friends. They stood on top of each other to reach the pot. Splash! Butter everywhere!",
    "Krishna shared the butter with his friends and the little monkeys too. Everyone laughed and danced together!",
    "His mum saw the mess but could not stay cross. Krishna's smile was too lovely! He loves joy and sharing.",
  ],
  'hanuman': [
    "A kind princess called Sita was taken away by a bad king. Her husband Rama was very sad. Who could help?",
    "A brave monkey called Hanuman said: \"I will go and find her!\" He stood on a tall mountain and looked at the big sea.",
    "Hanuman took a deep breath and JUMPED over the whole sea! He flew through the sky like a shooting star!",
    "Hanuman found Sita sitting under a tree. She was sad but brave. \"Rama is coming to help you!\" he said.",
    "Hanuman shows us that love and bravery can do amazing things. He always tried his very best for his friends.",
  ],
  'diwali': [
    "A kind prince called Rama lived long ago. His step-mum was not kind and made Rama go away to the forest.",
    "Rama went to the forest with his wife Sita and his brother. Then a bad king took Sita away! Rama was heartbroken.",
    "Rama and his brave friend Hanuman went to fight the bad king. Good fought evil — and GOOD WON!",
    "Rama, Sita, and his brother came home! Everyone was SO happy. People lit tiny lights called diyas to welcome them.",
    "Every year we have a party called Diwali! We light diyas and share sweets. Light always beats darkness!",
  ],
  'saraswati': [
    "There is a beautiful goddess called Saraswati. She wears white and sits on a big white flower. She loves books and music.",
    "Saraswati helps children learn. When you want to do well at school, you can say a little prayer to her.",
    "Saraswati plays beautiful music. Even the birds stop to listen! Music makes us feel happy and peaceful inside.",
    "Saraswati has a clever white swan that can always tell the good from the not-so-good. That is called being wise.",
    "Before you read a book, you can say hello to Saraswati. She loves children who enjoy learning!",
  ],
  'arjuna': [
    "A great teacher was showing princes how to shoot arrows. One boy was the very best of all. His name was Arjuna.",
    "The teacher put a toy bird on a tree. He asked every child: \"What can you see?\" They all had a look.",
    "One child said: \"I see the tree, the branch, the bird, the sky!\" The teacher said: \"Put your bow down. Not ready yet.\"",
    "Arjuna said: \"I can only see the eye of the bird.\" TWANG! His arrow hit perfectly. The teacher smiled and clapped!",
    "Arjuna's secret was to look only at what matters most. When you really pay attention, you can do amazing things!",
  ],
  'krishna-gita': [
    "Arjuna had to do something very hard. He sat down and cried. \"I do not want to hurt people I love!\" he said.",
    "His good friend Krishna sat next to him. \"I know you are sad,\" said Krishna. \"Let me tell you something helpful.\"",
    "\"Always try your very best,\" said Krishna. \"Stand up for what is right. Be brave and be kind to others!\"",
    "\"Remember,\" said Krishna, \"the real you inside is always safe and always there.\" Arjuna felt a little better.",
    "Krishna's kind words are written in a very special book. Its message: always try your best and never give up!",
  ],
  'prahlad': [
    "Long ago there was a very proud king who was not kind. He wanted everyone to love only him. But his son Prahlad said no!",
    "Every day, little Prahlad said thank you to God. His dad told him to stop. But Prahlad smiled and kept on praying.",
    "The king's sister sat in a big fire holding Prahlad. She wanted to hurt him! But something amazing happened!",
    "The magic cloak flew off and wrapped around Prahlad instead! The fire did not hurt him. Prahlad walked out safe!",
    "Every year we celebrate Holi! We light fires and remember that good wins. The next day we throw colourful powder!",
  ],
  'durga': [
    "A very scary monster had taken over the sky! He could change his shape into anything. No one could stop him!",
    "All the gods put their powers together. Bright lights came from them and a wonderful goddess appeared!",
    "She had ten arms and held lots of special things. She rode on a big, strong lion. Her name was Durga!",
    "Durga fought the scary monster for nine whole days and nights. She was so brave! On the tenth day, she won!",
    "Every year we have a joyful party called Navratri. We dance for nine nights to celebrate brave Goddess Durga!",
  ],
  'ganesh-moon': [
    "It was Ganesha's birthday! Everyone gave him lots of yummy sweets all day long. His big tummy was SO full!",
    "Ganesha got on his tiny mouse to ride home. The mouse was very small and the path was dark. Uh oh!",
    "The mouse tripped! THUD! Ganesha fell down with a big bump. All his yummy sweets rolled away. Poor Ganesha!",
    "The Moon up in the sky laughed at Ganesha. \"Ha ha ha, Ganesha fell!\" That was not very kind at all.",
    "Ganesha said: \"It is not kind to laugh when someone falls.\" On his birthday, we do not look at the moon.",
  ],
  'noah': [
    "God told a kind man called Noah: \"I will send lots of rain! Build a big boat and bring your family and the animals.\"",
    "Noah built a giant boat. Then all the animals came — two by two! Lions, elephants, penguins and more. In they went!",
    "The rain poured and poured for forty days! Water was everywhere. But Noah's boat kept everyone safe and dry.",
    "Noah sent a little bird called a dove to look for land. The dove came back with a leaf! Dry land was near!",
    "God put a beautiful rainbow in the sky. It was a promise: \"I will always love you.\" Rainbows are a sign of hope!",
  ],
  'david': [
    "David was a young boy who looked after sheep on a farm. He was small but he had a very big, brave heart.",
    "A very tall warrior called Goliath shouted: \"Send me your best fighter!\" Everyone was scared — except David.",
    "\"I will fight him!\" said David. Everyone was surprised. David picked up five small smooth stones and walked forward.",
    "David swung his sling — WHOOSH — the stone flew and hit Goliath on the head. The big giant fell right down!",
    "David shows us that a brave and kind heart matters more than being big or strong. Anyone can be a hero!",
  ],
  'ibrahim': [
    "A boy called Ibrahim loved looking up at the stars. He wondered: \"Who made all these beautiful things?\" He wanted to find out.",
    "Ibrahim saw a bright star. \"Is this God?\" But the star went away! \"God would never go away,\" he said.",
    "The big round moon came out. \"Is this God?\" But in the morning the moon was gone! Ibrahim kept on searching.",
    "The big bright sun came up. \"Is this God?\" But the sun went down too! Then Ibrahim understood something wonderful.",
    "Ibrahim found the answer! One God made everything and is always, always there. Ibrahim was so happy!",
  ],
  'kind-prophet': [
    "Every day, a kind man called the Prophet walked through the streets. Every day, an old lady threw rubbish on him.",
    "The Prophet never got cross. He just kept walking with a calm smile. His friends could not believe it!",
    "One day, there was no rubbish at all. The Prophet was worried! He went to knock on the old lady's door.",
    "The old lady was poorly in bed. The very man she had been unkind to had come to help her! She was so surprised.",
    "The old lady cried when she found out who he was. Being kind without wanting anything back is so powerful.",
  ],
  'siddhartha': [
    "A prince called Siddhartha lived in a beautiful palace. He had everything he wanted but had never seen the world outside.",
    "One day Siddhartha went outside. He saw someone very old, someone poorly, and someone who had died. He felt very sad.",
    "Then he saw a man with a big peaceful smile. \"Someone who has found peace inside.\" Siddhartha wanted that too.",
    "Siddhartha sat under a big tree and thought very hard for many days. He found peace! He became a wise, kind teacher.",
    "His message: be kind, be peaceful, and help others. Every single person deserves to be treated with kindness.",
  ],
  'angry-man': [
    "A very angry man came and shouted rude things. Everyone watched quietly to see what the Buddha would do.",
    "The Buddha just sat and listened with a calm, gentle smile. This made the angry man even MORE cross!",
    "\"If I give you a present and you say no thank you,\" said the Buddha, \"who does the present belong to?\"",
    "\"To the person who gave it,\" said the man. \"Yes!\" said the Buddha. \"You gave me your anger. I did not take it.\"",
    "The man felt free and calm. We can choose not to take on someone else's anger. Being peaceful is a superpower!",
  ],
}

export default function SacredStories({ avatar, profileName, profileId, onAddStars, onBack, ageGroup = 'early', progress = {}, onUpdateProgress }) {
  const [screen, setScreen] = useState('home')
  const [selectedReligion, setSelectedReligion] = useState(null)
  const [selectedStory, setSelectedStory] = useState(null)
  const [panelIdx, setPanelIdx] = useState(0)
  const [quizIdx, setQuizIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [starsEarned, setStarsEarned] = useState(0)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const correctAnswers = useRef(0)
  const questionMissedRef = useRef(false)
  const quizStrugglesRef = useRef([])
  const answerLockedRef = useRef(false)
  const quizTimerRef = useRef(null)
  useEffect(() => () => clearTimeout(quizTimerRef.current), [])
  const { speak } = useSpeech()
  const theme = THEMES[avatar] || THEMES.rumi

  const toddler = ageGroup === 'toddler'
  const speakOpts = toddler ? { rate: 0.8 } : {}
  const getPanelText = (storyId, idx, text) =>
    toddler ? (TODDLER_PANELS[storyId]?.[idx] ?? eyfsShorten(text)) : text

  // ── Completed stories — synced via progress (Supabase), localStorage as fallback ─
  const storageKey = `sacred_completed_${profileId || profileName}`
  const [completed, setCompleted] = useState(() => {
    if (progress?.sacredCompleted?.length > 0) return progress.sacredCompleted
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
  })

  const markCompleted = (storyId) => {
    setCompleted(prev => {
      if (prev.includes(storyId)) return prev
      const next = [...prev, storyId]
      onUpdateProgress?.({ sacredCompleted: next })
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const religion = RELIGIONS.find(r => r.id === selectedReligion)
  const story = religion?.stories.find(s => s.id === selectedStory)
  const panel = story?.panels[panelIdx]
  const quizQuestion = story?.quiz[quizIdx]

  const handleSelectReligion = (id) => {
    setSelectedReligion(id)
    setScreen('religion')
  }

  const handleSelectStory = (id) => {
    setSelectedStory(id)
    setPanelIdx(0)
    setQuizIdx(0)
    setSelectedOption(null)
    correctAnswers.current = 0
    questionMissedRef.current = false
    quizStrugglesRef.current = []
    setScreen('story')
    const s = religion.stories.find(st => st.id === id)
    if (s) speak(sacredPreprocess(getPanelText(id, 0, s.panels[0].text)), speakOpts)
  }

  const handleNextPanel = () => {
    if (panelIdx < story.panels.length - 1) {
      const next = panelIdx + 1
      setPanelIdx(next)
      speak(sacredPreprocess(getPanelText(selectedStory, next, story.panels[next].text)), speakOpts)
    } else {
      setScreen('quiz')
      speak(story.quiz[0].q, speakOpts)
    }
  }

  const handleAnswer = (option) => {
    if (selectedOption || answerLockedRef.current) return
    answerLockedRef.current = true
    setSelectedOption(option)
    if (option.correct) {
      if (!questionMissedRef.current) correctAnswers.current += 1
      speak('Correct! Well done!', speakOpts)
    } else {
      if (!questionMissedRef.current) quizStrugglesRef.current.push(quizQuestion.q)
      questionMissedRef.current = true
      speak('Good try. Think about what happened in the story, then choose again.', speakOpts)
      quizTimerRef.current = setTimeout(() => {
        setSelectedOption(null)
        answerLockedRef.current = false
      }, 1300)
      return
    }
    const nextIdx = quizIdx + 1
    quizTimerRef.current = setTimeout(() => {
      if (nextIdx < story.quiz.length) {
        setQuizIdx(nextIdx)
        setSelectedOption(null)
        questionMissedRef.current = false
        answerLockedRef.current = false
        speak(story.quiz[nextIdx].q, speakOpts)
      } else {
        const score = correctAnswers.current
        const total = story.quiz.length
        const stars = score >= total ? 3 : score >= total - 1 ? 2 : 1
        const first = !completed.includes(story.id)
        setIsFirstTime(first)
        setStarsEarned(stars)
        if (first) markCompleted(story.id)
        setScreen('complete')
        speak(`Amazing ${profileName}! You earned ${stars} ${stars === 1 ? 'star' : 'stars'}!`, speakOpts)
      }
    }, 1500)
  }

  const handleDone = () => {
    onAddStars('sacred', isFirstTime ? starsEarned : 0, {
      total: story.quiz.length,
      correct: correctAnswers.current,
      struggles: quizStrugglesRef.current,
      stayOnModule: false,
    })
    setScreen('religion')
    setSelectedStory(null)
    setSelectedOption(null)
    setQuizIdx(0)
    correctAnswers.current = 0
    questionMissedRef.current = false
    quizStrugglesRef.current = []
    answerLockedRef.current = false
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <HomeScreen theme={theme} onBack={onBack} onSelect={handleSelectReligion} completed={completed} />
        </motion.div>
      )}
      {screen === 'religion' && religion && (
        <motion.div key="religion" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <ReligionScreen religion={religion} theme={theme} onBack={() => setScreen('home')} onSelect={handleSelectStory} completed={completed} />
        </motion.div>
      )}
      {screen === 'story' && story && panel && (
        <motion.div key={`story-${panelIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <StoryScreen story={story} panel={panel} panelIdx={panelIdx} theme={theme}
            displayText={toddler ? getPanelText(selectedStory, panelIdx, panel.text) : undefined}
            onBack={() => setScreen('religion')} onNext={handleNextPanel} />
        </motion.div>
      )}
      {screen === 'quiz' && (
        <motion.div key={`quiz-${quizIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <QuizScreen question={quizQuestion} quizIdx={quizIdx} total={story.quiz.length}
            selectedOption={selectedOption} theme={theme}
            onAnswer={handleAnswer} onBack={() => { setPanelIdx(story.panels.length - 1); setScreen('story') }} />
        </motion.div>
      )}
      {screen === 'complete' && (
        <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <CompleteScreen story={story} stars={starsEarned} isFirstTime={isFirstTime}
            theme={theme} onDone={handleDone} profileName={profileName} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
