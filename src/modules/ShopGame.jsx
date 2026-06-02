import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'

const SHOP_ITEMS = [
  { id: 1, name: 'Lollipop', emoji: '🍭', price: 3, desc: 'Sweet treat!' },
  { id: 2, name: 'Balloon', emoji: '🎈', price: 5, desc: 'Up, up, away!' },
  { id: 3, name: 'Book', emoji: '📚', price: 7, desc: 'Learn something new!' },
  { id: 4, name: 'Toy Car', emoji: '🚗', price: 8, desc: 'Vroom vroom!' },
  { id: 5, name: 'Rainbow', emoji: '🌈', price: 10, desc: 'Beautiful colours!' },
  { id: 6, name: 'Crown', emoji: '👑', price: 12, desc: 'You are royalty!' },
  { id: 7, name: 'Unicorn', emoji: '🦄', price: 15, desc: 'Magical and rare!' },
  { id: 8, name: 'Rocket', emoji: '🚀', price: 20, desc: 'Blast off to space!' },
]

const COIN_VALUES = [
  { value: 1, emoji: '🪙', color: '#CD7F32', label: '1p' },
  { value: 2, emoji: '🟡', color: '#C0C0C0', label: '2p' },
  { value: 5, emoji: '🟠', color: '#FFD700', label: '5p' },
  { value: 10, emoji: '🔵', color: '#C0C0C0', label: '10p' },
  { value: 20, emoji: '🟣', color: '#FFD700', label: '20p' },
]

export default function ShopGame({ avatar, progress, onAddStars, onBack, onUpdateProgress, profileName }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()
  const [coins, setCoins] = useState(progress.shop?.coins ?? 20)
  const [basket, setBasket] = useState([])
  const [purchased, setPurchased] = useState(progress.shop?.purchases || [])
  const [selectedItem, setSelectedItem] = useState(null)
  const [mode, setMode] = useState('shop') // 'shop' | 'pay' | 'success'
  const [coinPile, setCoinPile] = useState([])
  const [change, setChange] = useState(0)
  const shopperName = profileName || 'Superstar'

  const totalBasket = basket.reduce((sum, item) => sum + item.price, 0)

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item)
    speak(`${item.name} costs ${item.price} pennies. Do you have enough. You have ${coins} pennies`, { mood: 'question' })
  }, [coins, speak])

  const addToBasket = useCallback(() => {
    if (!selectedItem) return
    if (coins < selectedItem.price) {
      speak(`Oh no. ${selectedItem.name} costs ${selectedItem.price} pennies but you only have ${coins}. That is not enough`, { mood: 'instruct' })
      setSelectedItem(null)
      return
    }
    setBasket(prev => [...prev, selectedItem])
    speak(`${selectedItem.name} added to your basket. It costs ${selectedItem.price} pennies`, { mood: 'celebrate' })
    setSelectedItem(null)
  }, [selectedItem, coins, speak])

  const removeFromBasket = useCallback((item) => {
    setBasket(prev => {
      const idx = prev.findIndex(b => b.id === item.id)
      if (idx === -1) return prev
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }, [])

  const goToPay = useCallback(() => {
    if (basket.length === 0) return
    if (coins < totalBasket) {
      speak(`You don't have enough pennies. You need ${totalBasket} but have ${coins}`, { mood: 'instruct' })
      return
    }
    setMode('pay')
    setCoinPile([])
    speak(`You need to pay ${totalBasket} pennies. Use the coins to make the right amount`, { mood: 'instruct' })
  }, [basket, coins, totalBasket, speak])

  const addCoin = useCallback((coin) => {
    const total = coinPile.reduce((s, c) => s + c.value, 0)
    if (total + coin.value > totalBasket + 20) return
    setCoinPile(prev => [...prev, { ...coin, id: Date.now() }])
    speak(`${coin.label}`, { rate: 1.1 })
  }, [coinPile, totalBasket, speak])

  const confirmPayment = useCallback(() => {
    const paid = coinPile.reduce((s, c) => s + c.value, 0)
    if (paid < totalBasket) {
      speak(`You've paid ${paid} pennies but need ${totalBasket}. Add more coins`, { mood: 'instruct' })
      return
    }
    const changeAmt = paid - totalBasket
    setChange(changeAmt)
    const newCoins = coins - totalBasket
    setCoins(newCoins)
    setPurchased(prev => [...prev, ...basket])
    setMode('success')
    confetti({ particleCount: 100, spread: 120, origin: { x: 0.5, y: 0.5 } })
    onAddStars('shop', basket.length, {
      total: basket.length,
      correct: basket.length,
      struggles: [],
    })
    onUpdateProgress?.({ shop: { coins: newCoins, purchases: [...purchased, ...basket] } })

    const msg = changeAmt > 0
      ? `Brilliant. You paid ${paid} pennies. Your change is ${changeAmt} pennies. Well done ${shopperName}`
      : `Perfect. You paid exactly ${paid} pennies. You are a superstar shopper`
    speak(msg, { mood: 'celebrate' })
  }, [coinPile, totalBasket, coins, basket, purchased, shopperName, speak, onAddStars, onUpdateProgress])

  const earnCoins = useCallback(() => {
    const earned = 5 + Math.floor(Math.random() * 10)
    setCoins(c => c + earned)
    speak(`You found ${earned} pennies. Great job`, { mood: 'celebrate' })
    confetti({ particleCount: 30, spread: 60 })
  }, [speak])

  // SUCCESS screen
  if (mode === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="text-7xl mb-3">🛍️</div>
          <h2 className="font-bubble text-3xl shimmer-text mb-2">Shopping Done!</h2>
          {change > 0 && (
            <p className="font-round text-lg mb-2" style={{ color: theme.text }}>
              Change: <span className="font-bold text-yellow-500">🪙 {change}p</span>
            </p>
          )}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {basket.map((item, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                className="text-4xl">{item.emoji}</motion.span>
            ))}
          </div>
          <p className="font-round mb-6" style={{ color: theme.text }}>
            You have <span className="font-bold text-yellow-500">🪙 {coins}p</span> left!
          </p>
          <div className="flex gap-3 justify-center">
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => { setMode('shop'); setBasket([]); setCoinPile([]); setSelectedItem(null) }}
              className="bubble-btn px-6 py-3 text-lg"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}>
              Shop Again 🛒
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
              className="bubble-btn px-6 py-3 text-lg"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
              Home 🏠
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // PAY screen
  if (mode === 'pay') {
    const paidAmount = coinPile.reduce((s, c) => s + c.value, 0)
    return (
      <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center px-4 pt-safe pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMode('shop')}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow mr-3"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <h2 className="font-bubble text-2xl shimmer-text">Pay Time! 💰</h2>
        </div>

        <div className="mx-4 rounded-3xl p-4 shadow-lg mb-4"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
          <p className="font-round text-white text-center">You need to pay</p>
          <p className="font-bubble text-5xl text-white text-center">🪙 {totalBasket}p</p>
          <p className="font-round text-white/80 text-center text-sm">
            You've added: {paidAmount}p {paidAmount >= totalBasket ? '✅ Enough!' : `(need ${totalBasket - paidAmount}p more)`}
          </p>
        </div>

        {/* Coin picker */}
        <div className="mx-4 mb-3">
          <p className="font-bubble text-lg mb-2" style={{ color: theme.text }}>Choose your coins:</p>
          <div className="flex gap-2 flex-wrap">
            {COIN_VALUES.map(coin => (
              <motion.button key={coin.value} whileTap={{ scale: 0.85 }}
                onClick={() => addCoin(coin)}
                className="w-16 h-16 rounded-full text-center flex flex-col items-center justify-center shadow-lg"
                style={{ background: coin.color, border: '3px solid rgba(255,255,255,0.6)' }}>
                <span className="font-bubble text-white text-lg leading-none">{coin.value}</span>
                <span className="font-round text-white text-xs">p</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Coin pile display */}
        <div className="mx-4 mb-4 min-h-[60px] p-3 rounded-2xl flex flex-wrap gap-1"
          style={{ background: theme.card }}>
          {coinPile.map((c, i) => (
            <motion.span key={c.id} initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }}
              className="text-2xl">{c.emoji}</motion.span>
          ))}
          {coinPile.length === 0 && (
            <p className="font-round text-sm opacity-50 w-full text-center" style={{ color: theme.text }}>
              Tap coins to add them!
            </p>
          )}
        </div>

        <div className="flex gap-2 mx-4">
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setCoinPile([])}
            className="flex-1 py-3 rounded-2xl font-bubble text-white"
            style={{ background: '#EF4444' }}>
            Clear Coins
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={confirmPayment}
            disabled={paidAmount < totalBasket}
            className="flex-1 py-3 rounded-2xl font-bubble text-white disabled:opacity-40"
            style={{ background: '#22C55E' }}>
            Pay! ✅
          </motion.button>
        </div>
      </div>
    )
  }

  // SHOP screen
  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <h1 className="font-bubble text-2xl shimmer-text">{shopperName}'s Shop</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={earnCoins}
          className="flex items-center gap-1 px-3 py-1 rounded-full font-bubble text-white shadow"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
          🪙 {coins}p
        </motion.button>
      </div>

      {/* Basket */}
      {basket.length > 0 && (
        <div className="mx-4 mb-2 p-3 rounded-2xl flex items-center gap-3"
          style={{ background: theme.card, border: `2px solid ${theme.secondary}` }}>
          <span className="text-2xl">🛒</span>
          <div className="flex-1 flex gap-1 flex-wrap">
            {basket.map((item, i) => (
              <motion.button key={i} whileTap={{ scale: 0.9 }}
                onClick={() => removeFromBasket(item)}
                className="text-xl bg-white rounded-lg px-2 py-1 shadow-sm relative">
                {item.emoji}
                <span className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">✕</span>
              </motion.button>
            ))}
          </div>
          <div className="text-right">
            <p className="font-bubble text-sm" style={{ color: theme.text }}>🪙 {totalBasket}p</p>
            <motion.button whileTap={{ scale: 0.9 }} onClick={goToPay}
              className="bubble-btn px-3 py-1 text-sm mt-1"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
              Pay!
            </motion.button>
          </div>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-2">
        {SHOP_ITEMS.map(item => {
          const canAfford = coins >= item.price
          const isPurchased = purchased.some(p => p.id === item.id)
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleItemClick(item)}
              className="rounded-3xl p-4 text-center shadow-lg"
              style={{
                background: isPurchased ? '#D1FAE5' : theme.card,
                border: `2px solid ${canAfford ? theme.secondary : '#FCA5A5'}`,
                opacity: isPurchased ? 0.8 : 1
              }}
            >
              <div className="text-5xl mb-2">{item.emoji}</div>
              <p className="font-bubble text-sm" style={{ color: theme.text }}>{item.name}</p>
              <p className="font-round text-xs opacity-60 mb-2" style={{ color: theme.text }}>{item.desc}</p>
              <span className={`font-bubble text-lg ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
                🪙 {item.price}p
              </span>
              {isPurchased && <p className="font-round text-xs text-green-600 mt-1">✅ Bought!</p>}
            </motion.button>
          )
        })}
      </div>

      {/* Item detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-6 text-center shadow-2xl"
            >
              <div className="text-7xl mb-3">{selectedItem.emoji}</div>
              <h3 className="font-bubble text-3xl mb-1" style={{ color: theme.text }}>{selectedItem.name}</h3>
              <p className="font-round opacity-70 mb-3" style={{ color: theme.text }}>{selectedItem.desc}</p>
              <p className="font-bubble text-3xl text-yellow-500 mb-4">🪙 {selectedItem.price}p</p>
              <p className="font-round text-sm mb-4" style={{ color: theme.text }}>
                You have: 🪙 {coins}p
                {coins >= selectedItem.price
                  ? <span className="text-green-600 ml-2">— You can afford it! ✅</span>
                  : <span className="text-red-500 ml-2">— Need {selectedItem.price - coins}p more ❌</span>
                }
              </p>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white"
                  style={{ background: '#9CA3AF' }}>
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={addToBasket}
                  disabled={coins < selectedItem.price}
                  className="flex-1 py-3 rounded-2xl font-bubble text-white disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                  Add to Basket 🛒
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
