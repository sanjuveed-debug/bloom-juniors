import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { dailySeedFor, seededShuffle } from '../../utils/seededRandom'
import { useSpeech } from '../../hooks/useSpeech'
import MatchingActivity from '../../components/MatchingActivity'

// Y3-4 and Y5-6 statutory word lists (NC England)
const WORD_SETS = {
  'Year 3-4': [
    { word: 'because',    hint: 'The reason something happens',              scrambled: 'uabcese'    },
    { word: 'believe',    hint: 'To think something is true',                scrambled: 'eivblee'    },
    { word: 'calendar',   hint: 'Shows the days and months of a year',       scrambled: 'alcdaenr'   },
    { word: 'caught',     hint: 'Past tense of "catch"',                     scrambled: 'thucag'     },
    { word: 'complete',   hint: 'To finish something fully',                 scrambled: 'mtecoelp'   },
    { word: 'consider',   hint: 'To think carefully about something',        scrambled: 'rednisco'   },
    { word: 'continue',   hint: 'To carry on doing something',               scrambled: 'iotncune'   },
    { word: 'describe',   hint: 'To say what something is like',             scrambled: 'ebidresc'   },
    { word: 'different',  hint: 'Not the same as something else',            scrambled: 'iftrndefe'  },
    { word: 'difficult',  hint: 'Not easy to do or understand',              scrambled: 'lutfiicfd'  },
    { word: 'disappear',  hint: 'To suddenly be impossible to see',          scrambled: 'sapairpde'  },
    { word: 'early',      hint: 'Before the usual time',                     scrambled: 'ylaer'      },
    { word: 'earth',      hint: 'The planet we live on',                     scrambled: 'rheta'      },
    { word: 'eight',      hint: 'The number after seven',                    scrambled: 'thige'      },
    { word: 'actually',   hint: 'In reality; used to emphasise a fact',      scrambled: 'tuallyca'   },
    { word: 'address',    hint: 'Where someone lives or a letter is sent',   scrambled: 'desrsad'    },
    { word: 'answer',     hint: 'A reply to a question',                     scrambled: 'rwenas'     },
    { word: 'appear',     hint: 'To become visible or seem to be',           scrambled: 'rapepa'     },
    { word: 'arrive',     hint: 'To reach a place',                          scrambled: 'ivarер'     },
    { word: 'bicycle',    hint: 'A two-wheeled vehicle you pedal',           scrambled: 'yclebic'    },
    { word: 'breath',     hint: 'The air you take in and let out',           scrambled: 'athbre'     },
    { word: 'build',      hint: 'To make or construct something',            scrambled: 'ldbui'      },
    { word: 'certain',    hint: 'Knowing something is definitely true',      scrambled: 'taincer'    },
    { word: 'circle',     hint: 'A perfectly round shape',                   scrambled: 'clecir'     },
    { word: 'decide',     hint: 'To make a choice',                          scrambled: 'idedec'     },
    { word: 'enough',     hint: 'As much as is needed',                      scrambled: 'ugheno'     },
    { word: 'exercise',   hint: 'Physical activity to keep fit',             scrambled: 'ciseexer'   },
    { word: 'famous',     hint: 'Known by many people',                      scrambled: 'ousfam'     },
    { word: 'favourite',  hint: 'The one you like most',                     scrambled: 'uritefavo'  },
    { word: 'forward',    hint: 'Towards the front',                         scrambled: 'wardfor'    },
    { word: 'grammar',    hint: 'The rules of a language',                   scrambled: 'mmargra'    },
    { word: 'guard',      hint: 'To protect or keep watch over',             scrambled: 'ardgu'      },
    { word: 'guide',      hint: 'To show someone the way',                   scrambled: 'idegu'      },
    { word: 'heard',      hint: 'Past tense of "hear"',                      scrambled: 'ardhe'      },
    { word: 'heart',      hint: 'The organ that pumps blood around the body',scrambled: 'arthe'      },
    { word: 'history',    hint: 'The study of past events',                  scrambled: 'toryhis'    },
    { word: 'imagine',    hint: 'To form a picture in your mind',            scrambled: 'gineima'    },
    { word: 'important',  hint: 'Having great value or significance',        scrambled: 'rtantimpo'  },
    { word: 'interest',   hint: 'A feeling of wanting to know more',         scrambled: 'restinte'   },
    { word: 'island',     hint: 'A piece of land surrounded by water',       scrambled: 'andisl'     },
    { word: 'knowledge',  hint: 'Facts and information you have learnt',     scrambled: 'ledgeknow'  },
    { word: 'learn',      hint: 'To gain new skills or information',         scrambled: 'arnle'      },
    { word: 'length',     hint: 'How long something is',                     scrambled: 'gthlen'     },
    { word: 'library',    hint: 'A place where you can borrow books',        scrambled: 'rarylib'    },
    { word: 'medicine',   hint: 'A substance taken to treat illness',        scrambled: 'cinemedi'   },
    { word: 'mention',    hint: 'To briefly refer to something',             scrambled: 'tionmen'    },
    { word: 'minute',     hint: 'Sixty seconds',                             scrambled: 'utemin'     },
    { word: 'natural',    hint: 'Existing in or caused by nature',           scrambled: 'uralnat'    },
    { word: 'naughty',    hint: 'Behaving badly or disobediently',           scrambled: 'ghtynau'    },
    { word: 'notice',     hint: 'To become aware of something',              scrambled: 'icenot'     },
    { word: 'often',      hint: 'Many times; frequently',                    scrambled: 'tenof'      },
    { word: 'opposite',   hint: 'Completely different; facing the other way',scrambled: 'siteoppo'   },
    { word: 'ordinary',   hint: 'Normal; not special or unusual',            scrambled: 'naryordi'   },
    { word: 'particular', hint: 'Specific; more than usual',                 scrambled: 'cularparti' },
    { word: 'peculiar',   hint: 'Strange or unusual',                        scrambled: 'liarpecu'   },
    { word: 'perhaps',    hint: 'Maybe; it is possible that',                scrambled: 'hapsper'    },
    { word: 'popular',    hint: 'Liked or enjoyed by many people',           scrambled: 'ularpop'    },
    { word: 'position',   hint: 'Where something or someone is placed',      scrambled: 'tionposi'   },
    { word: 'possible',   hint: 'Able to happen or be done',                 scrambled: 'ibleposs'   },
    { word: 'pressure',   hint: 'A steady force applied to something',       scrambled: 'surepres'   },
    { word: 'probably',   hint: 'Very likely to happen',                     scrambled: 'ablyprob'   },
    { word: 'promise',    hint: 'To say you will definitely do something',   scrambled: 'misepro'    },
    { word: 'purpose',    hint: 'The reason something exists or is done',    scrambled: 'posepur'    },
    { word: 'question',   hint: 'A sentence that asks for information',      scrambled: 'tionques'   },
    { word: 'recent',     hint: 'Having happened not long ago',              scrambled: 'entrec'     },
    { word: 'regular',    hint: 'Following a pattern; happening often',      scrambled: 'ularreg'    },
    { word: 'remember',   hint: 'To bring something back to mind',          scrambled: 'mberreme'   },
    { word: 'sentence',   hint: 'A group of words that makes complete sense',scrambled: 'encesent'   },
    { word: 'separate',   hint: 'To keep apart; not joined together',        scrambled: 'ratesepa'   },
    { word: 'special',    hint: 'Better or more important than usual',       scrambled: 'cialspe'    },
    { word: 'straight',   hint: 'Without a curve or bend',                   scrambled: 'ightstra'   },
    { word: 'strange',    hint: 'Unusual or surprising',                     scrambled: 'angestr'    },
    { word: 'strength',   hint: 'The power to do something; being strong',   scrambled: 'ngthstre'   },
    { word: 'suppose',    hint: 'To think or assume something is true',      scrambled: 'posesup'    },
    { word: 'surprise',   hint: 'Something unexpected',                      scrambled: 'risesurp'   },
    { word: 'therefore',  hint: 'For that reason; as a result',              scrambled: 'eforether'  },
    { word: 'thought',    hint: 'Past tense of "think"; an idea in the mind',scrambled: 'ughttho'    },
    { word: 'through',    hint: 'Moving in one side and out the other',      scrambled: 'oughthr'    },
    { word: 'various',    hint: 'Several different kinds of',                scrambled: 'iousvar'    },
    { word: 'weight',     hint: 'How heavy something is',                    scrambled: 'ghtwei'     },
    { word: 'woman',      hint: 'An adult female person',                    scrambled: 'manwo'      },
  ],
  'Year 5-6': [
    { word: 'accommodate',   hint: 'To provide a place for someone to stay', scrambled: 'odateaccomm'  },
    { word: 'accompany',     hint: 'To go somewhere with someone else',       scrambled: 'panyacco'     },
    { word: 'aggressive',    hint: 'Ready to attack or argue forcefully',     scrambled: 'ssiveaggre'   },
    { word: 'amateur',       hint: 'Someone who does something for fun, not money', scrambled: 'teurama'  },
    { word: 'ancient',       hint: 'Very old; belonging to the distant past', scrambled: 'ientanc'      },
    { word: 'apparent',      hint: 'Clearly visible or obvious',              scrambled: 'rentappa'     },
    { word: 'appreciate',    hint: 'To recognise the value of something',     scrambled: 'ciateappre'   },
    { word: 'attached',      hint: 'Joined or connected to something',        scrambled: 'chedatta'     },
    { word: 'available',     hint: 'Ready to be used or obtained',            scrambled: 'lableavai'    },
    { word: 'awkward',       hint: 'Causing difficulty; not graceful',        scrambled: 'wardawk'      },
    { word: 'bargain',       hint: 'Something bought for less than usual',    scrambled: 'gainbar'      },
    { word: 'bruise',        hint: 'A dark mark on skin from a knock',        scrambled: 'isebru'       },
    { word: 'category',      hint: 'A group of things that are similar',      scrambled: 'gorycate'     },
    { word: 'cemetery',      hint: 'A place where people are buried',         scrambled: 'teryceme'     },
    { word: 'committee',     hint: 'A group of people who make decisions',    scrambled: 'tteecommi'    },
    { word: 'communicate',   hint: 'To share information with others',        scrambled: 'icatecommun'  },
    { word: 'community',     hint: 'A group of people living in one place',   scrambled: 'nitycommu'    },
    { word: 'competition',   hint: 'A contest where people try to win',       scrambled: 'itioncompet'  },
    { word: 'conscience',    hint: 'Your inner sense of right and wrong',     scrambled: 'ienceconsc'   },
    { word: 'conscious',     hint: 'Aware of and responding to surroundings', scrambled: 'iousconsc'    },
    { word: 'correspond',    hint: 'To match; to write letters to someone',   scrambled: 'pondcorres'   },
    { word: 'criticise',     hint: 'To point out faults in something',        scrambled: 'cisecriti'    },
    { word: 'curiosity',     hint: 'A strong desire to know or learn things', scrambled: 'sitycurio'    },
    { word: 'definite',      hint: 'Clearly true; certain without doubt',     scrambled: 'nitedefi'     },
    { word: 'desperate',     hint: 'Very worried and needing something badly',scrambled: 'eratedesp'    },
    { word: 'determined',    hint: 'Having firm resolve; not giving up',      scrambled: 'mineddeter'   },
    { word: 'develop',       hint: 'To grow or become more advanced',         scrambled: 'elopdev'      },
    { word: 'dictionary',    hint: 'A book listing words and their meanings', scrambled: 'onarydicti'   },
    { word: 'disastrous',    hint: 'Causing great damage or suffering',       scrambled: 'trousdisas'   },
    { word: 'embarrass',     hint: 'To make someone feel awkward or ashamed', scrambled: 'rassembar'    },
    { word: 'environment',   hint: 'The natural world around us',             scrambled: 'nmentenviro'  },
    { word: 'especially',    hint: 'More than usual; particularly',           scrambled: 'iallyespec'   },
    { word: 'exaggerate',    hint: 'To make something sound bigger than it is',scrambled: 'erateexagg'  },
    { word: 'excellent',     hint: 'Extremely good; of very high quality',    scrambled: 'lentexcel'    },
    { word: 'existence',     hint: 'The fact of something being real or alive',scrambled: 'enceexist'   },
    { word: 'explanation',   hint: 'A reason given to make something clear',  scrambled: 'ationexplan'  },
    { word: 'familiar',      hint: 'Something you know well',                 scrambled: 'liarfami'     },
    { word: 'foreign',       hint: 'From or in a different country',          scrambled: 'eignfor'      },
    { word: 'forty',         hint: 'The number 40 (not "fourty"!)',           scrambled: 'rtyfo'        },
    { word: 'frequently',    hint: 'Happening often',                         scrambled: 'entlyfrequ'   },
    { word: 'government',    hint: 'The group of people who run a country',   scrambled: 'mentgovern'   },
    { word: 'guarantee',     hint: 'A firm promise that something will happen',scrambled: 'nteeguara'   },
    { word: 'identity',      hint: 'Who or what someone or something is',     scrambled: 'tityiden'     },
    { word: 'immediately',   hint: 'Without any delay; right now',            scrambled: 'atelyimmedi'  },
    { word: 'individual',    hint: 'A single person or thing',                scrambled: 'dualindivi'   },
    { word: 'interfere',     hint: 'To get involved in something uninvited',  scrambled: 'fereinter'    },
    { word: 'interrupt',     hint: 'To stop someone while they are speaking', scrambled: 'ruptinter'    },
    { word: 'language',      hint: 'A system of words used to communicate',   scrambled: 'uagelang'     },
    { word: 'leisure',       hint: 'Free time; time for relaxation',          scrambled: 'surelei'      },
    { word: 'lightning',     hint: 'A flash of electricity in a thunderstorm',scrambled: 'ninglight'    },
    { word: 'marvellous',    hint: 'Causing wonder; extremely good',          scrambled: 'llousmarve'   },
    { word: 'mischievous',   hint: 'Tending to play tricks or cause trouble', scrambled: 'evousmischi'  },
    { word: 'muscle',        hint: 'Body tissue that helps you move',         scrambled: 'clemus'       },
    { word: 'necessary',     hint: 'Something that must be done or had',      scrambled: 'saryneces'    },
    { word: 'neighbour',     hint: 'Someone who lives near you',              scrambled: 'bourneigh'    },
    { word: 'nuisance',      hint: 'Something annoying or inconvenient',      scrambled: 'ancenuis'     },
    { word: 'occupy',        hint: 'To live in or take control of a place',   scrambled: 'upyocc'       },
    { word: 'occur',         hint: 'To happen',                               scrambled: 'curoc'        },
    { word: 'parliament',    hint: 'The group of elected people who make laws',scrambled: 'mentparlia'  },
    { word: 'persuade',      hint: 'To convince someone to do something',     scrambled: 'uadepers'     },
    { word: 'physical',      hint: 'Relating to the body rather than the mind',scrambled: 'icalphys'    },
    { word: 'prejudice',     hint: 'An unfair judgement about someone',       scrambled: 'dicepreju'    },
    { word: 'privilege',     hint: 'A special right or advantage',            scrambled: 'legeprivi'    },
    { word: 'profession',    hint: 'A job needing special training',          scrambled: 'ssionprofe'   },
    { word: 'programme',     hint: 'A plan of events; a TV or radio show',    scrambled: 'ammeprogr'    },
    { word: 'pronunciation', hint: 'The way a word is spoken aloud',          scrambled: 'iationpronunc'},
    { word: 'queue',         hint: 'A line of people waiting',                scrambled: 'euequ'        },
    { word: 'recognise',     hint: 'To identify something seen before',       scrambled: 'niserecog'    },
    { word: 'recommend',     hint: 'To suggest something as being good',      scrambled: 'mendrecom'    },
    { word: 'relevant',      hint: 'Closely connected to the matter at hand', scrambled: 'vantrele'     },
    { word: 'restaurant',    hint: 'A place where you pay to eat meals',      scrambled: 'urantresta'   },
    { word: 'rhythm',        hint: 'A regular pattern of beats in music',     scrambled: 'thmrhy'       },
    { word: 'sacrifice',     hint: 'To give up something valuable',           scrambled: 'ficesacri'    },
    { word: 'secretary',     hint: 'An assistant who manages letters and admin',scrambled: 'tarysecre'  },
    { word: 'soldier',       hint: 'Someone who serves in an army',           scrambled: 'diersol'      },
    { word: 'stomach',       hint: 'The organ in your body that digests food',scrambled: 'machsto'      },
    { word: 'sufficient',    hint: 'Enough for a particular purpose',         scrambled: 'cientsuffi'   },
    { word: 'suggest',       hint: 'To put forward an idea for consideration',scrambled: 'gestsug'      },
    { word: 'temperature',   hint: 'How hot or cold something is',            scrambled: 'aturetemper'  },
    { word: 'thorough',      hint: 'Complete; done with great care',          scrambled: 'oughthor'     },
    { word: 'twelfth',       hint: 'The ordinal number for 12',               scrambled: 'lfthtwe'      },
    { word: 'variety',       hint: 'A number of different types of something',scrambled: 'ietyvar'      },
    { word: 'vegetable',     hint: 'An edible plant or part of a plant',      scrambled: 'tablevege'    },
    { word: 'vehicle',       hint: 'A machine used for transporting people',  scrambled: 'icleveh'      },
    { word: 'yacht',         hint: 'A large sailing or motor boat',           scrambled: 'chtya'        },
  ],
}

export default function SpellingModule({ theme, onDone, onBack, played = 0 }) {
  const { speak } = useSpeech()
  const autoLevel = played >= 3 ? 'Year 5-6' : 'Year 3-4'
  const [level, setLevel] = useState(null)
  const [words, setWords] = useState([])
  const [q, setQ] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [hint, setHint] = useState(false)
  const [result, setResult] = useState(null)
  const [matchPairs, setMatchPairs] = useState(null)
  const lockedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const startLevel = (lv) => {
    const shuffled = seededShuffle(WORD_SETS[lv], dailySeedFor('spelling-' + lv)).slice(0, 10)
    lockedRef.current = false
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setWords(shuffled)
    setLevel(lv)
    setQ(0)
    setScore(0)
    setInput('')
    setFeedback(null)
    setHint(false)
    speak(`${lv} spelling! Read the clue, unscramble the letters, and type the correct spelling. Use the hint if you need help!`, { mood: 'instruct' })
  }

  const handleSubmit = () => {
    if (lockedRef.current) return
    const val = input.trim()
    if (!val) return
    lockedRef.current = true
    const correct = val.toLowerCase() === words[q].word
    const ns = score + (correct ? 1 : 0)
    if (correct) confetti({ particleCount: 50, spread: 70, origin: { x: 0.5, y: 0.4 } })
    setFeedback({ correct, word: words[q].word })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      setInput('')
      setHint(false)
      if (q + 1 >= words.length) {
        confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.3 } })
        setResult({ score: ns, total: words.length })
      } else {
        setQ(q + 1)
        lockedRef.current = false
      }
    }, 1400)
    timersRef.current.push(id)
  }

  if (result) {
    const { score: s, total } = result
    const pct = s / total
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1
    const msg = pct >= 0.9 ? 'Amazing spelling! 🏆' : pct >= 0.6 ? 'Great effort! Keep it up!' : 'Good try! Practice makes perfect!'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6" style={{ background: theme.bg }}>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-4 text-center"
          style={{ background: theme.card, border: `2px solid ${theme.primary}60` }}>
          <p className="font-bubble text-white text-2xl">Spelling Done!</p>
          <div className="flex gap-1 text-4xl">
            {[1,2,3].map(n => (
              <motion.span key={n} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + n * 0.12, type: 'spring' }}
                style={{ opacity: n <= stars ? 1 : 0.2 }}>⭐</motion.span>
            ))}
          </div>
          <p className="font-bubble text-5xl" style={{ color: theme.accent }}>{s}<span className="text-2xl text-white/40"> / {total}</span></p>
          <p className="font-round text-white/70 text-base">{msg}</p>
        </motion.div>
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }} onClick={() => onDone(s, total)}
          className="w-full max-w-sm py-5 rounded-2xl font-bubble text-white text-xl"
          style={{ background: theme.primary, boxShadow: `0 4px 20px ${theme.glow}60` }}>
          Done ✓
        </motion.button>
      </div>
    )
  }

  if (matchPairs) return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMatchPairs(null)} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">🎯 Word Match</p>
      </div>
      <p className="font-round text-white/55 text-xs text-center font-bold mt-3 px-6">
        Match each clue to its word!
      </p>
      <div className="flex-1 pt-4 pb-10 overflow-y-auto">
        <MatchingActivity
          pairs={matchPairs}
          colour="#34D399"
          tileTextClass="text-sm"
          onSpeak={(text) => speak(String(text), { mood: 'instruct' })}
          onComplete={(misses, total) => {
            if (lockedRef.current) return
            lockedRef.current = true
            const correct = Math.max(0, total - misses)
            confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } })
            speak('All words matched! Brilliant!', { mood: 'celebrate' })
            setMatchPairs(null)
            setResult({ score: correct, total })
          }}
        />
      </div>
    </div>
  )

  if (!level) return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">Spelling</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <div className="text-center mb-2">
          <p className="font-round text-white/60 text-sm">Recommended for you</p>
          <p className="font-bubble text-white/40 text-xs mt-0.5">
            {played >= 3 ? 'You\'ve unlocked Year 5-6! 🔓' : 'Complete 3 sessions to unlock Year 5-6'}
          </p>
        </div>
        {Object.keys(WORD_SETS).map((lv, i) => {
          const isRecommended = lv === autoLevel
          return (
            <motion.button key={lv}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.95 }} onClick={() => startLevel(lv)}
              className="w-full max-w-sm py-6 rounded-2xl font-bubble text-white text-2xl text-center relative"
              style={{
                background: isRecommended ? theme.primary : theme.card,
                border: `2px solid ${isRecommended ? theme.primary : theme.primary + '30'}`,
                boxShadow: isRecommended ? `0 4px 20px ${theme.glow}50` : 'none',
              }}>
              {lv}
              {isRecommended && <span className="absolute top-2 right-3 font-round text-xs text-white/70">★ Recommended</span>}
            </motion.button>
          )
        })}

        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            lockedRef.current = false
            const pool = seededShuffle(WORD_SETS[autoLevel], Date.now() % 100000).slice(0, 5)
            setMatchPairs(pool.map((w, i) => ({ id: `w${i}`, question: w.hint, answer: w.word })))
            speak('Word Match! Read each clue and tap its matching word.', { mood: 'instruct' })
          }}
          className="w-full max-w-sm rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #34D399, #059669)' }}
        >
          <span className="text-3xl">🎯</span>
          <span className="text-left flex-1">
            <span className="font-bubble text-white text-lg block leading-tight">Word Match</span>
            <span className="font-round text-white/80 text-xs">Match clues to words — a gentler way to learn them</span>
          </span>
        </motion.button>
      </div>
    </div>
  )

  const curr = words[q]
  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: theme.accent, width: `${(q / words.length) * 100}%` }} />
        </div>
        <span className="font-round text-white/60 text-sm">{q + 1}/{words.length}</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={{ scale: score > 0 ? 1.5 : 1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-bubble text-yellow-300 text-sm"
          >
            ⭐{score}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl"
          style={{ background: `${theme.primary}25`, border: `1px solid ${theme.primary}40` }}>
          <span className="text-sm">🎯</span>
          <p className="font-round text-white/70 text-xs font-bold">Read the clue · unscramble · type the correct spelling</p>
        </div>

        <div className="w-full max-w-sm p-6 rounded-3xl text-center" style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <p className="font-round text-white/40 text-xs mb-1 uppercase tracking-wider">Unscramble these letters</p>
          <p className="font-bubble text-3xl mb-3 tracking-widest" style={{ color: theme.accent, letterSpacing: '0.25em' }}>
            {curr.scrambled.toUpperCase()}
          </p>
          <p className="font-round text-white/50 text-sm">"{curr.hint}"</p>
          {hint && (
            <p className="font-round mt-2 text-sm" style={{ color: theme.accent }}>
              First letter: <strong>{curr.word[0].toUpperCase()}</strong> · {curr.word.length} letters
            </p>
          )}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`px-6 py-3 rounded-2xl font-bubble text-lg ${feedback.correct ? 'bg-green-500/80' : 'bg-orange-500/70'} text-white`}>
              {feedback.correct ? `⭐ Correct — ${feedback.word}!` : `✗ It's: ${feedback.word}`}
            </motion.div>
          )}
        </AnimatePresence>

        <input type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Type the word..."
          className="w-full max-w-xs text-center text-xl font-round py-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.08)', border: `2px solid ${theme.primary}80`, color: 'white', outline: 'none' }}
          autoCapitalize="none" autoCorrect="off" spellCheck={false} />

        <div className="flex gap-3 w-full max-w-xs">
          {!hint && (
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setHint(true)}
              className="flex-1 py-3 rounded-2xl font-round text-white/60 text-sm"
              style={{ background: theme.card, border: `1px solid ${theme.primary}30` }}>
              💡 Hint
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.93 }} onClick={handleSubmit}
            className="flex-1 py-3 rounded-2xl font-bubble text-white"
            style={{ background: theme.primary, boxShadow: `0 4px 16px ${theme.glow}50` }}>
            Check ✓
          </motion.button>
        </div>
      </div>
    </div>
  )
}
