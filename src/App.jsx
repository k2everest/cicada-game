import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// Símbolos do jogo com valores otimizados para engajamento
const symbols = [
  { name: 'DIAMANTE_LAPIDADO', emoji: '💎', value: 1000, rarity: 0.02 },
  { name: 'DIAMANTE_BRUTO', emoji: '💠', value: 500, rarity: 0.05 },
  { name: 'RUBI', emoji: '🔴', value: 250, rarity: 0.08 },
  { name: 'ESMERALDA', emoji: '🟢', value: 100, rarity: 0.15 },
  { name: 'SAFIRA', emoji: '🔵', value: 50, rarity: 0.25 },
  { name: 'AMETISTA', emoji: '🟣', value: 25, rarity: 0.45 }
]

function App() {
  // Estados de navegação
  const [currentGame, setCurrentGame] = useState('slots') // 'slots' ou 'treasure'
  
  // Estados principais
  const [balance, setBalance] = useState(5000)
  const [bet, setBet] = useState(50)
  const [reels, setReels] = useState([0, 0, 0, 0, 0])
  const [spinning, setSpinning] = useState(false)
  const [message, setMessage] = useState('Bem-vindo ao Cicada')
  const [winAmount, setWinAmount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [jackpotPool, setJackpotPool] = useState(50000)
  const [nearMiss, setNearMiss] = useState(false)
  const [multiplier, setMultiplier] = useState(1)
  const [autoPlay, setAutoPlay] = useState(false)
  const [spinsCount, setSpinsCount] = useState(0)
  const [achievements, setAchievements] = useState([])
  const [lastWins, setLastWins] = useState([])
  
  // Estados do Desafio do Tesouro
  const [treasureChests, setTreasureChests] = useState([])
  const [roundWinnings, setRoundWinnings] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [chestOpening, setChestOpening] = useState(false)
  const [treasureLevel, setTreasureLevel] = useState(1)
  const [treasureRisk, setTreasureRisk] = useState(0.2)
  
  // Sistema de conquistas
  const checkAchievements = (newWin, newStreak, newSpins) => {
    const newAchievements = []
    
    if (newWin > 1000 && !achievements.includes('BIG_WIN')) {
      newAchievements.push('BIG_WIN')
    }
    if (newStreak >= 5 && !achievements.includes('HOT_STREAK')) {
      newAchievements.push('HOT_STREAK')
    }
    if (newSpins >= 100 && !achievements.includes('PERSISTENT')) {
      newAchievements.push('PERSISTENT')
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements])
      setBalance(prev => prev + 500)
    }
  }

  // Algoritmo de near miss otimizado
  const generateNearMiss = () => {
    const nearMissReels = []
    const targetSymbol = Math.floor(Math.random() * 3)
    
    for (let i = 0; i < 5; i++) {
      if (i < 2) {
        nearMissReels.push(targetSymbol)
      } else if (i === 2) {
        nearMissReels.push((targetSymbol + 1) % symbols.length)
      } else {
        nearMissReels.push(Math.floor(Math.random() * symbols.length))
      }
    }
    
    return nearMissReels
  }

  // Sistema de recompensas variáveis
  const calculateWin = (reels) => {
    let win = 0
    let winType = ''
    
    if (reels.every(reel => reel === 0)) {
      win = jackpotPool
      winType = 'JACKPOT'
      setJackpotPool(50000)
    }
    else if (reels.filter(reel => reel === reels[0]).length === 4) {
      win = symbols[reels[0]].value * bet * 10
      winType = 'MEGA'
    }
    else if (reels.filter(reel => reel === reels[0]).length === 3) {
      win = symbols[reels[0]].value * bet * 3
      winType = 'BIG'
    }
    else if (reels.filter(reel => reel === reels[0]).length === 2) {
      win = symbols[reels[0]].value * bet * 0.5
      winType = 'SMALL'
    }
    
    return { win: Math.floor(win * multiplier), winType }
  }

  // Função principal de giro
  const spin = () => {
    if (balance < bet) {
      setMessage('Saldo insuficiente')
      return
    }

    setSpinning(true)
    setBalance(prev => prev - bet)
    setMessage('Girando...')
    setWinAmount(0)
    setShowCelebration(false)
    setNearMiss(false)
    setSpinsCount(prev => prev + 1)
    
    setJackpotPool(prev => prev + Math.floor(bet * 0.1))

    const shouldWin = Math.random() < 0.25
    const shouldNearMiss = Math.random() < 0.3
    
    setTimeout(() => {
      let newReels
      
      if (shouldWin) {
        const winSymbol = Math.floor(Math.random() * symbols.length)
        const winCount = Math.random() < 0.1 ? 5 : Math.random() < 0.3 ? 4 : 3
        newReels = Array(5).fill(0).map((_, i) => 
          i < winCount ? winSymbol : Math.floor(Math.random() * symbols.length)
        )
      } else if (shouldNearMiss) {
        newReels = generateNearMiss()
        setNearMiss(true)
      } else {
        newReels = Array(5).fill(0).map(() => Math.floor(Math.random() * symbols.length))
      }
      
      setReels(newReels)
      
      const { win, winType } = calculateWin(newReels)
      
      if (win > 0) {
        setBalance(prev => prev + win)
        setWinAmount(win)
        setShowCelebration(true)
        setStreak(prev => prev + 1)
        setXp(prev => prev + Math.floor(win / 10))
        setLastWins(prev => [...prev, win].slice(-5))
        
        if (winType === 'JACKPOT') {
          setMessage('JACKPOT SUPREMO!')
        } else if (winType === 'MEGA') {
          setMessage(`MEGA VITÓRIA! +${win.toLocaleString()}`)
        } else if (winType === 'BIG') {
          setMessage(`GRANDE VITÓRIA! +${win.toLocaleString()}`)
        } else {
          setMessage(`Vitória! +${win.toLocaleString()}`)
        }
        
        checkAchievements(win, streak + 1, spinsCount + 1)
      } else {
        setStreak(0)
        if (nearMiss) {
          setMessage('Quase! Tente novamente!')
        } else {
          setMessage('Continue tentando!')
        }
      }
      
      if (xp >= level * 1000) {
        setLevel(prev => prev + 1)
        setMultiplier(prev => prev + 0.1)
        setBalance(prev => prev + level * 100)
        setMessage(prev => prev + ` NÍVEL ${level + 1}!`)
      }
      
      setSpinning(false)
    }, 2000)
  }

  // Auto-play
  useEffect(() => {
    if (autoPlay && !spinning && balance >= bet) {
      const timer = setTimeout(spin, 1000)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, spinning, balance, bet, spin])

  // Controles de aposta
  const adjustBet = (amount) => {
    const newBet = Math.max(10, Math.min(balance, bet + amount))
    setBet(newBet)
  }

  const maxBet = () => {
    setBet(Math.min(1000, balance))
  }

  // ===== FUNÇÕES DO DESAFIO DO TESOURO =====
  
  // Inicializar nova rodada do Desafio do Tesouro
  const startTreasureRound = () => {
    if (balance < bet) {
      setMessage('Saldo insuficiente')
      return
    }
    
    setBalance(prev => prev - bet)
    setRoundWinnings(0)
    setGameOver(false)
    setMessage('Escolha um baú para abrir!')
    
    // Gerar baús para a rodada (5-8 baús por rodada)
    const numChests = Math.floor(Math.random() * 4) + 5
    const chests = []
    
    for (let i = 0; i < numChests; i++) {
      const isTrap = Math.random() < treasureRisk
      let reward = 0
      
      if (!isTrap) {
        // Recompensas baseadas no nível e aposta
        const baseReward = bet * (0.5 + Math.random() * 2)
        reward = Math.floor(baseReward * treasureLevel * (1 + Math.random()))
      }
      
      chests.push({
        id: i,
        opened: false,
        isTrap,
        reward,
        type: isTrap ? 'trap' : reward > bet * 2 ? 'big' : 'small'
      })
    }
    
    setTreasureChests(chests)
  }
  
  // Abrir baú
  const openChest = (chestId) => {
    if (chestOpening || gameOver) return
    
    setChestOpening(true)
    
    setTimeout(() => {
      const chest = treasureChests.find(c => c.id === chestId)
      const updatedChests = treasureChests.map(c => 
        c.id === chestId ? { ...c, opened: true } : c
      )
      
      setTreasureChests(updatedChests)
      
      if (chest.isTrap) {
        // Armadilha - perde metade dos ganhos da rodada
        const lost = Math.floor(roundWinnings * 0.5)
        setRoundWinnings(prev => prev - lost)
        setMessage(`ARMADILHA! Perdeu ${lost.toLocaleString()} moedas!`)
        setGameOver(true)
        
        // Adicionar ganhos restantes ao saldo
        setTimeout(() => {
          setBalance(prev => prev + roundWinnings - lost)
          setTreasureRisk(prev => Math.min(0.8, prev + 0.05)) // Aumenta risco
        }, 1000)
        
      } else {
        // Recompensa
        setRoundWinnings(prev => prev + chest.reward)
        setMessage(`+${chest.reward.toLocaleString()} moedas! Continue ou saque?`)
        setTreasureRisk(prev => Math.min(0.8, prev + 0.1)) // Aumenta risco significativamente
        
        // Verificar se todos os baús seguros foram abertos
        const remainingChests = updatedChests.filter(c => !c.opened)
        const safeChests = remainingChests.filter(c => !c.isTrap)
        
        if (safeChests.length === 0) {
          setMessage(`Todos os tesouros coletados! +${(roundWinnings + chest.reward).toLocaleString()}`)
          setGameOver(true)
          setTimeout(() => {
            setBalance(prev => prev + roundWinnings + chest.reward)
            setTreasureLevel(prev => prev + 0.1) // Aumenta nível
          }, 1000)
        }
      }
      
      setChestOpening(false)
    }, 1500)
  }
  
  // Sacar ganhos da rodada
  const cashOut = () => {
    if (roundWinnings > 0) {
      setBalance(prev => prev + roundWinnings)
      setMessage(`Sacou ${roundWinnings.toLocaleString()} moedas!`)
      setLastWins(prev => [...prev, roundWinnings].slice(-5))
      setXp(prev => prev + Math.floor(roundWinnings / 10))
      
      // Reset para próxima rodada
      setRoundWinnings(0)
      setTreasureChests([])
      setGameOver(false)
      setTreasureRisk(0.2) // Reset do risco
      
      checkAchievements(roundWinnings, streak + 1, spinsCount + 1)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Premium estilo Amazon/Apple */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cicada
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <span>Premium Gaming</span>
                <span>•</span>
                <span>Nível {level}</span>
              </div>
              
              {/* Navegação entre jogos */}
              <div className="flex items-center space-x-2 ml-8">
                <Button
                  onClick={() => setCurrentGame('slots')}
                  variant={currentGame === 'slots' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                >
                  Slots
                </Button>
                <Button
                  onClick={() => setCurrentGame('treasure')}
                  variant={currentGame === 'treasure' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                >
                  Desafio do Tesouro
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Saldo</div>
                <div className="text-lg font-semibold text-gray-900">{balance.toLocaleString()}</div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {level}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section com Mosaico de Banners */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Banner Principal */}
            <div className="lg:col-span-2">
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative p-8 lg:p-12 text-white">
                  <div className="mb-6">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                      Experiência Premium
                      <br />
                      <span className="text-blue-300">de Jogos</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-8">
                      Tecnologia avançada, design excepcional e recompensas incríveis
                    </p>
                  </div>
                  
                  {/* Conteúdo do jogo baseado na seleção */}
                  {currentGame === 'slots' ? (
                    /* Slot Machine Premium */
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                      <div className="flex justify-center space-x-3 mb-6">
                        {reels.map((reelIndex, index) => (
                          <div
                            key={index}
                            className={`w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-xl flex items-center justify-center shadow-lg ${
                              spinning ? 'animate-pulse' : ''
                            } ${showCelebration ? 'animate-bounce' : ''} ${nearMiss && index === 2 ? 'ring-2 ring-red-400' : ''}`}
                          >
                            <span className="text-2xl lg:text-3xl">
                              {symbols[reelIndex].emoji}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center mb-4">
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                          winAmount > 1000 
                            ? 'bg-blue-400 text-white' 
                            : winAmount > 0 
                            ? 'bg-green-400 text-white'
                            : nearMiss
                            ? 'bg-red-400 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          {message}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Desafio do Tesouro */
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">Desafio do Tesouro</h3>
                        <p className="text-blue-100">Abra baús e colete tesouros, mas cuidado com as armadilhas!</p>
                      </div>
                      
                      {treasureChests.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3 mb-6">
                          {treasureChests.map((chest) => (
                            <button
                              key={chest.id}
                              onClick={() => openChest(chest.id)}
                              disabled={chest.opened || chestOpening || gameOver}
                              className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                                chest.opened
                                  ? chest.isTrap
                                    ? 'bg-red-500 text-white'
                                    : 'bg-green-500 text-white'
                                  : 'bg-white hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105'
                              } ${chestOpening ? 'animate-pulse' : ''}`}
                            >
                              {chest.opened 
                                ? chest.isTrap 
                                  ? '💀' 
                                  : chest.type === 'big' 
                                    ? '💎' 
                                    : '💰'
                                : '📦'
                              }
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🏴‍☠️</div>
                          <p className="text-blue-100 mb-4">Pronto para a aventura?</p>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                          roundWinnings > 0 
                            ? 'bg-green-400 text-white' 
                            : 'bg-white/20 text-white'
                        }`}>
                          {message}
                        </div>
                        {roundWinnings > 0 && (
                          <div className="mt-2 text-green-300 font-bold">
                            Ganhos da rodada: {roundWinnings.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar com Stats */}
            <div className="space-y-6">
              {/* Jackpot Card */}
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
                <div className="text-sm font-medium opacity-90 mb-1">Jackpot Progressivo</div>
                <div className="text-2xl font-bold">{jackpotPool.toLocaleString()}</div>
                <div className="text-xs opacity-75 mt-2">Aumenta a cada jogada</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Sequência</div>
                  <div className="text-xl font-bold text-gray-900">{streak}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Multiplicador</div>
                  <div className="text-xl font-bold text-gray-900">{multiplier.toFixed(1)}x</div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>XP: {xp}</span>
                  <span>Próximo: {level * 1000}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (xp / (level * 1000)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Últimas Vitórias */}
              {lastWins.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-sm font-medium text-gray-900 mb-3">Últimas Vitórias</div>
                  <div className="space-y-2">
                    {lastWins.slice(0, 3).map((win, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Vitória #{index + 1}</span>
                        <span className="text-sm font-medium text-green-600">+{win.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Controles Premium */}
      <section className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Controles de Aposta */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-sm font-medium text-gray-700 mb-4">Configurar Aposta</div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => adjustBet(-100)}
                disabled={spinning || bet <= 100}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400"
              >
                -100
              </Button>
              <Button
                onClick={() => adjustBet(-50)}
                disabled={spinning || bet <= 50}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400"
              >
                -50
              </Button>
              <Button
                onClick={() => adjustBet(-10)}
                disabled={spinning || bet <= 10}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400"
              >
                -10
              </Button>
              
              <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 min-w-[120px] text-center">
                <div className="text-xs text-gray-500">Aposta</div>
                <div className="text-lg font-semibold text-gray-900">{bet}</div>
              </div>
              
              <Button
                onClick={() => adjustBet(10)}
                disabled={spinning || bet >= balance}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400"
              >
                +10
              </Button>
              <Button
                onClick={() => adjustBet(50)}
                disabled={spinning || bet >= balance}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400"
              >
                +50
              </Button>
              <Button
                onClick={() => adjustBet(100)}
                disabled={spinning || bet >= balance}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400"
              >
                +100
              </Button>
              <Button
                onClick={maxBet}
                disabled={spinning}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-600 hover:border-purple-400"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Botões Principais */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentGame === 'slots' ? (
              <>
                <Button
                  onClick={spin}
                  disabled={spinning || balance < bet}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-12 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {spinning ? 'Girando...' : 'GIRAR'}
                </Button>
                
                <Button
                  onClick={() => setAutoPlay(!autoPlay)}
                  disabled={spinning || balance < bet}
                  variant={autoPlay ? "destructive" : "outline"}
                  className="font-semibold text-lg px-8 py-4 rounded-xl"
                >
                  {autoPlay ? 'PARAR AUTO' : 'AUTO PLAY'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={startTreasureRound}
                  disabled={chestOpening || balance < bet || (treasureChests.length > 0 && !gameOver)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg px-12 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {treasureChests.length > 0 && !gameOver ? 'Rodada em Andamento' : 'INICIAR EXPEDIÇÃO'}
                </Button>
                
                {roundWinnings > 0 && !gameOver && (
                  <Button
                    onClick={cashOut}
                    disabled={chestOpening}
                    variant="outline"
                    className="font-semibold text-lg px-8 py-4 rounded-xl border-green-500 text-green-600 hover:bg-green-50"
                  >
                    SACAR ({roundWinnings.toLocaleString()})
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Conquistas */}
      {achievements.length > 0 && (
        <section className="bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conquistas Desbloqueadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm font-medium text-gray-900">
                    {achievement === 'BIG_WIN' && 'Grande Vitória'}
                    {achievement === 'HOT_STREAK' && 'Sequência Quente'}
                    {achievement === 'PERSISTENT' && 'Persistente'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">+500 moedas</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Cicada Premium Gaming. Tecnologia avançada para experiências excepcionais.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

