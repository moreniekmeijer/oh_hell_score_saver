import React, { useState, useEffect } from 'react';
import { 
  Trophy, Play, RotateCcw, Undo2, UserPlus, UserMinus, 
  ChevronRight, Plus, Minus, Info, X, Award, History, 
  Settings, HelpCircle, Star, ArrowLeft, Trash2, ArrowUp, ArrowDown, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'boerenbridge_active_game';
const HISTORY_KEY = 'boerenbridge_game_history';

const DEFAULT_PLAYERS = ['Alice', 'Bob', 'Charlie'];

export default function App() {
  // Navigation / View State
  // Views: 'HOME', 'SETUP', 'PLAY', 'HISTORY', 'RULES'
  const [view, setView] = useState('HOME');
  
  // Game Setup State
  const [setupPlayers, setSetupPlayers] = useState(DEFAULT_PLAYERS);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [numRounds, setNumRounds] = useState(10);
  const [setupError, setSetupError] = useState('');

  // Active Game State
  const [players, setPlayers] = useState([]); // [{ name, score }]
  const [totalRounds, setTotalRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentStep, setCurrentStep] = useState('TRICKS'); // 'TRICKS', 'BIDS', 'WINS', 'ROUND_SUMMARY'
  const [roundTricks, setRoundTricks] = useState(5);
  const [bids, setBids] = useState({}); // { name: bid }
  const [wins, setWins] = useState({}); // { name: wins }
  const [isSkipped, setIsSkipped] = useState(false);
  const [history, setHistory] = useState([]); // Array of { round, tricks, bids, wins, isSkipped, playerSnapshots: { name: { score, delta } } }
  
  // Past Games History State
  const [pastGames, setPastGames] = useState([]);
  
  // Active Player rotation info
  const [startingIndex, setStartingIndex] = useState(0);
  const [orderedPlayers, setOrderedPlayers] = useState([]);

  // Custom modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' | 'alert'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  // Load initial data from Local Storage
  useEffect(() => {
    const savedActive = localStorage.getItem(STORAGE_KEY);
    if (savedActive) {
      try {
        const data = JSON.parse(savedActive);
        // Load active game back into state
        setPlayers(data.players || []);
        setTotalRounds(data.totalRounds || 10);
        setCurrentRound(data.currentRound || 1);
        setCurrentStep(data.currentStep || 'TRICKS');
        setRoundTricks(data.roundTricks || 5);
        setBids(data.bids || {});
        setWins(data.wins || {});
        setIsSkipped(data.isSkipped || false);
        setHistory(data.history || []);
        setView('PLAY');
      } catch (e) {
        console.error('Failed to parse saved active game state:', e);
      }
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setPastGames(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse saved game history:', e);
      }
    }
  }, []);

  // Save active game to Local Storage on change
  useEffect(() => {
    if (view === 'PLAY' && players.length > 0) {
      const activeState = {
        players,
        totalRounds,
        currentRound,
        currentStep,
        roundTricks,
        bids,
        wins,
        isSkipped,
        history
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeState));
    }
  }, [view, players, totalRounds, currentRound, currentStep, roundTricks, bids, wins, isSkipped, history]);

  // Rotate starting player when current round changes or players change
  useEffect(() => {
    if (players.length > 0) {
      const idx = (currentRound - 1) % players.length;
      setStartingIndex(idx);
      const ordered = [...players.slice(idx), ...players.slice(0, idx)];
      setOrderedPlayers(ordered);
    }
  }, [players, currentRound]);

  // Modal handlers
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (title, message) => {
    setModal({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: closeModal,
      onCancel: null
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
      onCancel: closeModal
    });
  };

  // Setup Functions
  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    
    // Title case formatting
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    if (setupPlayers.includes(formattedName)) {
      setSetupError('Player name must be unique.');
      return;
    }
    if (setupPlayers.length >= 6) {
      setSetupError('Maximum 6 players allowed.');
      return;
    }

    setSetupPlayers([...setupPlayers, formattedName]);
    setNewPlayerName('');
    setSetupError('');
  };

  const removePlayer = (index) => {
    const newPlayers = [...setupPlayers];
    newPlayers.splice(index, 1);
    setSetupPlayers(newPlayers);
    setSetupError('');
  };

  const movePlayer = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === setupPlayers.length - 1) return;

    const newPlayers = [...setupPlayers];
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    const temp = newPlayers[index];
    newPlayers[index] = newPlayers[swapWith];
    newPlayers[swapWith] = temp;
    setSetupPlayers(newPlayers);
  };

  const startNewGame = () => {
    if (setupPlayers.length < 3) {
      setSetupError('At least 3 players are required to start the game.');
      return;
    }
    if (numRounds < 1 || numRounds > 19) {
      setSetupError('Number of rounds must be between 1 and 19.');
      return;
    }

    // Initialize Game State
    const initialPlayers = setupPlayers.map(name => ({ name, score: 0 }));
    setPlayers(initialPlayers);
    setTotalRounds(numRounds);
    setCurrentRound(1);
    setCurrentStep('TRICKS');
    setRoundTricks(5);
    setBids({});
    setWins({});
    setIsSkipped(false);
    setHistory([]);
    setSetupError('');
    setView('PLAY');
  };

  const deleteActiveGame = () => {
    showConfirm(
      'Exit Active Game',
      'Are you sure you want to exit the active game? All current progress will be lost.',
      () => {
        localStorage.removeItem(STORAGE_KEY);
        setPlayers([]);
        setHistory([]);
        setView('HOME');
      }
    );
  };

  // Skip Round Logic
  const skipRound = () => {
    const prevSnapshots = history.length > 0 ? history[history.length - 1].playerSnapshots : {};
    
    const playerSnapshots = {};
    players.forEach(p => {
      const prevScore = prevSnapshots[p.name]?.score || 0;
      playerSnapshots[p.name] = { score: prevScore, delta: 0 };
    });

    const newHistoryEntry = {
      round: currentRound,
      tricks: 0,
      bids: {},
      wins: {},
      isSkipped: true,
      playerSnapshots
    };

    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);
    
    // In skipped round, scores remain exactly the same.
    setIsSkipped(true);
    setCurrentStep('ROUND_SUMMARY');
  };

  // Bidding Step Logic
  const handleBidSelect = (playerIdx, value) => {
    const player = orderedPlayers[playerIdx];
    setBids(prev => ({
      ...prev,
      [player.name]: value
    }));
  };

  // Check if a bid value is forbidden for the dealer (last player in bidding order)
  const isBidForbidden = (playerIdx, bidVal) => {
    if (playerIdx !== orderedPlayers.length - 1) return false;
    
    let sumOtherBids = 0;
    for (let i = 0; i < orderedPlayers.length - 1; i++) {
      const name = orderedPlayers[i].name;
      sumOtherBids += bids[name] !== undefined ? bids[name] : 0;
    }
    return (sumOtherBids + bidVal) === roundTricks;
  };

  const proceedToWins = () => {
    // Validate that all bids are entered
    const allBidsEntered = orderedPlayers.every(p => bids[p.name] !== undefined);
    if (!allBidsEntered) {
      showAlert('Missing Bids', 'Please select a bid for all players before continuing.');
      return;
    }

    // Verify last player constraint
    const lastPlayer = orderedPlayers[orderedPlayers.length - 1];
    let sumBids = 0;
    orderedPlayers.forEach(p => {
      sumBids += bids[p.name];
    });

    if (sumBids === roundTricks) {
      showAlert(
        'Invalid Bids Sum',
        `The sum of all player bids (${sumBids}) cannot equal the total tricks in this round (${roundTricks}). Please adjust the dealer's bid.`
      );
      return;
    }

    // Initialize wins with empty values
    const initialWins = {};
    orderedPlayers.forEach(p => {
      initialWins[p.name] = undefined;
    });
    setWins(initialWins);
    setCurrentStep('WINS');
  };

  // Wins Step Logic
  const handleWinSelect = (playerIdx, value) => {
    const player = orderedPlayers[playerIdx];
    setWins(prev => ({
      ...prev,
      [player.name]: value
    }));
  };

  const getSumWins = () => {
    let sum = 0;
    orderedPlayers.forEach(p => {
      if (wins[p.name] !== undefined) {
        sum += wins[p.name];
      }
    });
    return sum;
  };

  const calculateRoundScores = () => {
    // Validate all wins entered
    const allWinsEntered = orderedPlayers.every(p => wins[p.name] !== undefined);
    if (!allWinsEntered) {
      showAlert('Missing Wins', 'Please enter trick wins for all players before calculating scores.');
      return;
    }

    // Validate sum of wins equals tricks
    const sumWins = getSumWins();
    if (sumWins !== roundTricks) {
      showAlert(
        'Invalid Wins Sum',
        `The total tricks won (${sumWins}) must equal the number of tricks in this round (${roundTricks}).`
      );
      return;
    }

    // All validation passed. Calculate scores and save round snapshot
    const prevSnapshots = history.length > 0 ? history[history.length - 1].playerSnapshots : {};
    
    // Update players' scores in-place or construct the new ones
    const playerSnapshots = {};
    const updatedPlayers = players.map(p => {
      const bid = bids[p.name];
      const win = wins[p.name];
      let delta = 0;

      if (win === bid) {
        delta = 10 + (win * 2);
      } else {
        delta = -2 * Math.abs(bid - win);
      }

      const prevScore = prevSnapshots[p.name]?.score || 0;
      const newScore = prevScore + delta;
      
      playerSnapshots[p.name] = { score: newScore, delta };

      return {
        ...p,
        score: newScore
      };
    });

    const newHistoryEntry = {
      round: currentRound,
      tricks: roundTricks,
      bids: { ...bids },
      wins: { ...wins },
      isSkipped: false,
      playerSnapshots
    };

    setPlayers(updatedPlayers);
    setHistory([...history, newHistoryEntry]);
    setIsSkipped(false);
    setCurrentStep('ROUND_SUMMARY');
  };

  const undoCurrentRoundInput = () => {
    if (currentStep === 'WINS') {
      setCurrentStep('BIDS');
    } else if (currentStep === 'BIDS') {
      setCurrentStep('TRICKS');
    }
  };

  const undoLastCompletedRound = () => {
    if (history.length === 0) return;
    
    showConfirm(
      'Undo Last Round',
      'Are you sure you want to undo the last completed round? The scores will revert to the previous state.',
      () => {
        const newHistory = [...history];
        const popped = newHistory.pop();
        setHistory(newHistory);
        
        // Revert player scores based on new last history entry
        const prevSnapshots = newHistory.length > 0 ? newHistory[newHistory.length - 1].playerSnapshots : {};
        
        const revertedPlayers = players.map(p => ({
          ...p,
          score: prevSnapshots[p.name]?.score || 0
        }));

        setPlayers(revertedPlayers);
        setCurrentRound(popped.round);
        
        if (popped.isSkipped) {
          setRoundTricks(5);
          setBids({});
          setWins({});
          setCurrentStep('TRICKS');
        } else {
          setRoundTricks(popped.tricks);
          setBids(popped.bids);
          setWins(popped.wins);
          setCurrentStep('WINS');
        }
      }
    );
  };

  const nextRound = () => {
    if (currentRound >= totalRounds) {
      // Game is over! Save to history and open GAMEOVER
      saveGameToHistory();
    } else {
      // Reset bids, wins for the next round
      setCurrentRound(prev => prev + 1);
      setBids({});
      setWins({});
      setRoundTricks(5); // Default to 5
      setCurrentStep('TRICKS');
    }
  };

  const saveGameToHistory = () => {
    const finalLeaderboard = [...players].sort((a, b) => b.score - a.score);
    const winners = finalLeaderboard.filter(p => p.score === finalLeaderboard[0].score).map(p => p.name);
    
    const newPastGame = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      players: players.map(p => ({ name: p.name, score: p.score })),
      totalRounds,
      winners,
      historySnapshot: history
    };

    const updatedPastGames = [newPastGame, ...pastGames];
    setPastGames(updatedPastGames);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedPastGames));
    
    // Clear active game cache
    localStorage.removeItem(STORAGE_KEY);
    
    // Trigger confetti
    triggerConfetti();
    
    setCurrentStep('GAMEOVER');
  };

  const triggerConfetti = () => {
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7c3aed', '#a855f7', '#10b981', '#f59e0b']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7c3aed', '#a855f7', '#10b981', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const deletePastGame = (id, event) => {
    event.stopPropagation();
    showConfirm(
      'Delete Game Record',
      'Are you sure you want to delete this game record from history? This cannot be undone.',
      () => {
        const updated = pastGames.filter(g => g.id !== id);
        setPastGames(updated);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      }
    );
  };

  const clearAllHistory = () => {
    showConfirm(
      'Clear History Log',
      'Are you sure you want to permanently clear the entire game history? This action is permanent and cannot be undone.',
      () => {
        setPastGames([]);
        localStorage.removeItem(HISTORY_KEY);
      }
    );
  };

  const restartWithSamePlayers = () => {
    const prevNames = players.map(p => p.name);
    setSetupPlayers(prevNames);
    setNumRounds(totalRounds);
    
    const initialPlayers = prevNames.map(name => ({ name, score: 0 }));
    setPlayers(initialPlayers);
    setCurrentRound(1);
    setCurrentStep('TRICKS');
    setRoundTricks(5);
    setBids({});
    setWins({});
    setIsSkipped(false);
    setHistory([]);
    setView('PLAY');
  };

  // Helper selectors
  const getLeaderboard = () => {
    return [...players].sort((a, b) => b.score - a.score);
  };

  // Main UI Render Helpers
  const renderHome = () => {
    const activeGameSaved = localStorage.getItem(STORAGE_KEY);
    return (
      <div className="home-screen fade-in">
        <div className="hero-logo-container">
          <div className="logo-badge">
            <Star className="logo-star-icon animate-pulse" />
          </div>
          <h1>Oh Hell!</h1>
          <p className="subtitle">Boerenbridge Score Saver</p>
        </div>

        <div className="main-actions-card glass-panel">
          {activeGameSaved && (
            <button 
              className="btn btn-accent btn-large"
              onClick={() => {
                const data = JSON.parse(activeGameSaved);
                setPlayers(data.players || []);
                setTotalRounds(data.totalRounds || 10);
                setCurrentRound(data.currentRound || 1);
                setCurrentStep(data.currentStep || 'TRICKS');
                setRoundTricks(data.roundTricks || 5);
                setBids(data.bids || {});
                setWins(data.wins || {});
                setIsSkipped(data.isSkipped || false);
                setHistory(data.history || []);
                setView('PLAY');
              }}
            >
              <Play className="btn-icon" /> Resume Active Game
            </button>
          )}

          <button 
            className="btn btn-primary btn-large"
            onClick={() => {
              setSetupError('');
              setView('SETUP');
            }}
          >
            <UserPlus className="btn-icon" /> Start New Game
          </button>

          <div className="home-secondary-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setView('HISTORY')}
            >
              <History className="btn-icon" /> Game History
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setView('RULES')}
            >
              <HelpCircle className="btn-icon" /> Game Rules
            </button>
          </div>
        </div>

        {pastGames.length > 0 && (
          <div className="recent-games-peek glass-panel">
            <h3>Recent Games</h3>
            <div className="recent-games-list">
              {pastGames.slice(0, 2).map(g => (
                <div key={g.id} className="recent-game-item">
                  <div className="rg-info">
                    <span className="rg-date">{g.date}</span>
                    <span className="rg-players">{g.players.length} players • {g.totalRounds} rounds</span>
                  </div>
                  <div className="rg-winner">
                    <Trophy className="winner-trophy-sm text-yellow" />
                    <span className="rg-winner-name">{g.winners.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
            {pastGames.length > 2 && (
              <button className="btn-text" onClick={() => setView('HISTORY')}>
                Show all history ({pastGames.length} games)
              </button>
            )}
          </div>
        )}

        <footer className="home-footer">
          <p>Made for Boerenbridge & Oh Hell players</p>
        </footer>
      </div>
    );
  };

  const renderSetup = () => {
    return (
      <div className="setup-screen fade-in">
        <div className="top-navigation">
          <button className="btn-back" onClick={() => setView('HOME')}>
            <ArrowLeft /> Back
          </button>
          <h2>Configure Game</h2>
          <div style={{ width: '40px' }}></div>
        </div>

        <div className="setup-content-container">
          <div className="setup-card glass-panel">
            <h3>Players Selection</h3>
            <p className="card-hint">Add 3 to 6 players. Arrange seating order using arrows.</p>

            <div className="add-player-input-group">
              <input
                type="text"
                placeholder="Enter player name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addPlayer(); }}
                maxLength={12}
                className="input-field"
              />
              <button className="btn btn-primary btn-add" onClick={addPlayer}>
                <Plus size={20} />
              </button>
            </div>

            {setupError && <div className="error-message">{setupError}</div>}

            <div className="setup-players-list">
              {setupPlayers.map((name, index) => (
                <div key={index} className="setup-player-item glass-item">
                  <div className="player-meta">
                    <span className="player-index">{index + 1}</span>
                    <span className="player-name">{name}</span>
                  </div>
                  <div className="player-actions">
                    <button 
                      className="btn-icon-only" 
                      onClick={() => movePlayer(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      className="btn-icon-only" 
                      onClick={() => movePlayer(index, 'down')}
                      disabled={index === setupPlayers.length - 1}
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      className="btn-icon-only text-danger" 
                      onClick={() => removePlayer(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="setup-card glass-panel">
            <h3>Game Settings</h3>
            
            <div className="rounds-selector-group">
              <label>Number of rounds to play:</label>
              <div className="rounds-stepper">
                <button 
                  className="btn-stepper"
                  disabled={numRounds <= 1}
                  onClick={() => setNumRounds(prev => Math.max(1, prev - 1))}
                >
                  <Minus size={18} />
                </button>
                <span className="stepper-value">{numRounds}</span>
                <button 
                  className="btn-stepper"
                  disabled={numRounds >= 19}
                  onClick={() => setNumRounds(prev => Math.min(19, prev + 1))}
                >
                  <Plus size={18} />
                </button>
              </div>
              <p className="card-hint mt-2">Standard games are usually 10 rounds.</p>
            </div>

            <button 
              className="btn btn-accent btn-large w-full mt-6"
              onClick={startNewGame}
            >
              Start Scorekeeper <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveGame = () => {
    return (
      <div className="active-game-screen fade-in">
        <div className="game-top-bar glass-panel">
          <div className="game-progress-info">
            <span className="round-badge">Round {currentRound} / {totalRounds}</span>
            <span className="rounds-left-label">{totalRounds - currentRound} rounds remaining</span>
          </div>
          
          <div className="game-options">
            {history.length > 0 && currentStep === 'TRICKS' && (
              <button className="btn btn-secondary btn-sm" onClick={undoLastCompletedRound}>
                <Undo2 size={16} /> Undo Round
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={deleteActiveGame}>
              <X size={16} /> Exit Game
            </button>
          </div>
        </div>

        <div className="game-main-layout">
          {/* Main Scoring Input Area */}
          <div className="scoring-input-container">
            {currentStep === 'TRICKS' && renderStepTricks()}
            {currentStep === 'BIDS' && renderStepBids()}
            {currentStep === 'WINS' && renderStepWins()}
            {currentStep === 'ROUND_SUMMARY' && renderStepSummary()}
            {currentStep === 'GAMEOVER' && renderStepGameOver()}
          </div>

          {/* Quick Score Standings Column (Sticky) */}
          {currentStep !== 'GAMEOVER' && (
            <div className="side-standings-container glass-panel">
              <h3>Score Standings</h3>
              <div className="standings-list">
                {getLeaderboard().map((p, idx) => {
                  return (
                    <div key={p.name} className="standing-row">
                      <div className="standing-rank">
                        {idx === 0 ? <Trophy size={16} className="text-yellow" /> : `${idx + 1}`}
                      </div>
                      <div className="standing-player-name">{p.name}</div>
                      <div className="standing-player-score">{p.score} pts</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStepTricks = () => {
    return (
      <div className="step-card glass-panel card-tricks fade-in">
        <div className="step-header">
          <span className="step-indicator">Step 1 of 3</span>
          <h2>Round {currentRound} Tricks</h2>
          <p className="hint-text">Choose the number of tricks for this round's cards.</p>
        </div>

        <div className="tricks-selector-wheel">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
            <button
              key={val}
              className={`btn-trick-val ${roundTricks === val ? 'active' : ''}`}
              onClick={() => setRoundTricks(val)}
            >
              {val}
            </button>
          ))}
        </div>

        <div className="custom-trick-info glass-item">
          <div className="starting-player-banner">
            <Award size={18} className="text-accent" />
            <span>
              <strong>{orderedPlayers[0]?.name}</strong> leads first cards this round.
            </span>
          </div>
        </div>

        <div className="step-actions mt-6">
          <button className="btn btn-secondary text-danger" onClick={skipRound}>
            Skip This Round
          </button>
          <button 
            className="btn btn-accent btn-large"
            onClick={() => setCurrentStep('BIDS')}
          >
            Enter Player Bids <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderStepBids = () => {
    // Total sum of currently entered bids
    let currentSum = 0;
    orderedPlayers.forEach(p => {
      if (bids[p.name] !== undefined) {
        currentSum += bids[p.name];
      }
    });

    const isAllBidsEntered = orderedPlayers.every(p => bids[p.name] !== undefined);

    return (
      <div className="step-card glass-panel card-bids fade-in">
        <div className="step-header">
          <div className="step-header-meta">
            <span className="step-indicator">Step 2 of 3</span>
            <span className="badge badge-tricks">{roundTricks} Tricks</span>
          </div>
          <h2>Collect Bids</h2>
          <p className="hint-text">Each player guesses how many tricks they will win. Bids cannot sum to {roundTricks}.</p>
        </div>

        <div className="bids-inputs-list">
          {orderedPlayers.map((player, idx) => {
            const isDealer = idx === orderedPlayers.length - 1;
            const isFirst = idx === 0;
            const currentBid = bids[player.name];

            // Calculate dealer forbidden bid
            let sumOtherBids = 0;
            for (let i = 0; i < orderedPlayers.length - 1; i++) {
              const name = orderedPlayers[i].name;
              sumOtherBids += bids[name] !== undefined ? bids[name] : 0;
            }
            const forbiddenVal = roundTricks - sumOtherBids;

            return (
              <div key={player.name} className={`player-input-row glass-item ${currentBid !== undefined ? 'completed' : ''}`}>
                <div className="row-player-info">
                  <span className="row-player-name">
                    {player.name} <span className="row-player-score-inline">({player.score} pts)</span>
                  </span>
                  <div className="row-player-badges">
                    {isFirst && <span className="badge badge-start">Start</span>}
                    {isDealer && <span className="badge badge-dealer">Dealer (Last)</span>}
                  </div>
                </div>

                <div className="row-input-selector">
                  <div className="number-selector-buttons">
                    {Array.from({ length: roundTricks + 1 }, (_, bVal) => {
                      const isDisabled = isDealer && bVal === forbiddenVal;
                      return (
                        <button
                          key={bVal}
                          className={`btn-num-select ${currentBid === bVal ? 'selected' : ''}`}
                          disabled={isDisabled}
                          onClick={() => handleBidSelect(idx, bVal)}
                        >
                          {bVal}
                        </button>
                      );
                    })}
                  </div>
                  {isDealer && forbiddenVal >= 0 && forbiddenVal <= roundTricks && (
                    <span className="dealer-warning-label">
                      Dealer cannot bid <strong>{forbiddenVal}</strong> (avoids total bid sum = {roundTricks}).
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bids-summary-banner glass-item">
          <span>Total Bids Entered: <strong>{currentSum}</strong></span>
          <span className="bids-constraint-info">
            Tricks: <strong>{roundTricks}</strong> (Sum is {currentSum === roundTricks ? 'EQUAL' : 'NOT EQUAL'})
          </span>
        </div>

        <div className="step-actions mt-6">
          <button className="btn btn-secondary" onClick={undoCurrentRoundInput}>
            <ArrowLeft size={16} /> Back
          </button>
          <button 
            className="btn btn-accent btn-large"
            disabled={!isAllBidsEntered || currentSum === roundTricks}
            onClick={proceedToWins}
          >
            Play Round & Record Wins <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderStepWins = () => {
    const sumWins = getSumWins();
    const isAllWinsEntered = orderedPlayers.every(p => wins[p.name] !== undefined);
    const isValidSum = sumWins === roundTricks;

    return (
      <div className="step-card glass-panel card-wins fade-in">
        <div className="step-header">
          <div className="step-header-meta">
            <span className="step-indicator">Step 3 of 3</span>
            <span className="badge badge-tricks">{roundTricks} Tricks</span>
          </div>
          <h2>Record Wins</h2>
          <p className="hint-text">Enter how many tricks each player actually won. Sum must equal {roundTricks}.</p>
        </div>

        <div className="wins-inputs-list">
          {orderedPlayers.map((player, idx) => {
            const isDealer = idx === orderedPlayers.length - 1;
            const currentWin = wins[player.name];
            const bidVal = bids[player.name];

            return (
              <div key={player.name} className={`player-input-row glass-item ${currentWin !== undefined ? 'completed' : ''}`}>
                <div className="row-player-info">
                  <span className="row-player-name">
                    {player.name} <span className="row-player-score-inline">({player.score} pts)</span>
                  </span>
                  <div className="row-player-badges">
                    <span className="badge badge-bid-outline">Bid: {bidVal}</span>
                    {isDealer && <span className="badge badge-dealer">Dealer</span>}
                  </div>
                </div>

                <div className="row-input-selector">
                  <div className="number-selector-buttons">
                    {Array.from({ length: roundTricks + 1 }, (_, wVal) => (
                      <button
                        key={wVal}
                        className={`btn-num-select ${currentWin === wVal ? 'selected' : ''}`}
                        onClick={() => handleWinSelect(idx, wVal)}
                      >
                        {wVal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`wins-summary-banner glass-item ${isAllWinsEntered && !isValidSum ? 'alert-danger' : ''}`}>
          <span>Total Wins Entered: <strong className={isValidSum ? 'text-success' : 'text-danger'}>{sumWins}</strong> / <strong>{roundTricks}</strong></span>
          {isAllWinsEntered && !isValidSum && (
            <span className="wins-alert-label">
              Wins must sum to exactly {roundTricks}. Please adjust player wins.
            </span>
          )}
        </div>

        <div className="step-actions mt-6">
          <button className="btn btn-secondary" onClick={undoCurrentRoundInput}>
            <ArrowLeft size={16} /> Back
          </button>
          <button 
            className="btn btn-accent btn-large"
            disabled={!isAllWinsEntered || !isValidSum}
            onClick={calculateRoundScores}
          >
            Calculate Round Scores <Check size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderStepSummary = () => {
    const roundSnapshot = history[history.length - 1];
    
    return (
      <div className="step-card glass-panel card-summary fade-in">
        <div className="step-header">
          <h2>Round {currentRound} Results</h2>
          <p className="hint-text">Here is how scores updated after this round.</p>
        </div>

        {roundSnapshot && !roundSnapshot.isSkipped && (
          <div className="round-result-cards">
            {orderedPlayers.map(p => {
              const bid = roundSnapshot.bids[p.name];
              const win = roundSnapshot.wins[p.name];
              const snapshot = roundSnapshot.playerSnapshots[p.name];
              const isSuccess = bid === win;

              return (
                <div key={p.name} className={`player-result-badge glass-item ${isSuccess ? 'success' : 'failed'}`}>
                  <div className="prb-header">
                    <span className="prb-name">{p.name}</span>
                    <span className={`prb-status-tag ${isSuccess ? 'tag-success' : 'tag-failed'}`}>
                      {isSuccess ? 'Correct!' : 'Failed'}
                    </span>
                  </div>
                  <div className="prb-details">
                    <div className="prb-stats">
                      <span>Bid: <strong>{bid}</strong></span>
                      <span>Won: <strong>{win}</strong></span>
                    </div>
                    <div className="prb-score">
                      <span className="prb-delta">{snapshot.delta >= 0 ? `+${snapshot.delta}` : snapshot.delta} pts</span>
                      <span className="prb-total">Total: {snapshot.score}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {roundSnapshot && roundSnapshot.isSkipped && (
          <div className="skipped-round-notice glass-item">
            <Info size={24} className="text-accent" />
            <div>
              <h4>Round {currentRound} was skipped</h4>
              <p>Player scores remain unchanged. Click "Next Round" to proceed.</p>
            </div>
          </div>
        )}

        <div className="scoreboard-history-section mt-8">
          <h3>Cumulative Scoreboard</h3>
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Tricks</th>
                  {players.map(p => (
                    <th key={p.name}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, hIdx) => (
                  <tr key={hIdx} className={hIdx === history.length - 1 ? 'last-rowHighlight' : ''}>
                    <td>Round {h.round} {h.isSkipped && '(Skipped)'}</td>
                    <td>{h.isSkipped ? '-' : h.tricks}</td>
                    {players.map(p => {
                      const snap = h.playerSnapshots[p.name];
                      if (!snap) return <td key={p.name}>-</td>;
                      return (
                        <td key={p.name}>
                          <div className="table-score-cell">
                            <span className="total">{snap.score}</span>
                            <span className={`delta ${snap.delta >= 0 ? 'pos' : 'neg'}`}>
                              ({snap.delta >= 0 ? `+${snap.delta}` : snap.delta})
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="step-actions mt-8">
          <button className="btn btn-secondary" onClick={undoLastCompletedRound}>
            <Undo2 size={16} /> Undo Round Input
          </button>
          <button 
            className="btn btn-accent btn-large"
            onClick={nextRound}
          >
            {currentRound >= totalRounds ? 'Finish & Save Game' : 'Proceed to Next Round'} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderStepGameOver = () => {
    const leaderboard = getLeaderboard();
    const winningScore = leaderboard[0]?.score || 0;
    const winnersList = leaderboard.filter(p => p.score === winningScore);
    const isTie = winnersList.length > 1;

    return (
      <div className="step-card glass-panel card-game-over fade-in">
        <div className="game-over-header">
          <div className="trophy-gold-container">
            <Trophy size={64} className="trophy-gold-icon bounce-animation" />
          </div>
          <h2>Game Completed!</h2>
          
          <h1 className="winner-announcement gradient-text text-glow">
            {isTie ? 'Tie Game!' : `${winnersList[0]?.name} Wins!`}
          </h1>
          
          <p className="winner-details">
            {isTie 
              ? `A tie between ${winnersList.map(w => w.name).join(' & ')} with ${winningScore} points!`
              : `Congratulations to ${winnersList[0]?.name} for winning with ${winningScore} points!`
            }
          </p>
        </div>

        {/* Podium Display */}
        <div className="podium-display mt-8">
          {leaderboard.slice(0, 3).map((p, idx) => {
            let rankClass = 'second';
            let rankNum = '2nd';
            if (idx === 0) { rankClass = 'first'; rankNum = '1st'; }
            if (idx === 2) { rankClass = 'third'; rankNum = '3rd'; }

            // Re-order display visually: 2nd, 1st, 3rd
            const order = idx === 0 ? 2 : idx === 1 ? 1 : 3;

            return (
              <div key={p.name} className={`podium-column ${rankClass}`} style={{ order }}>
                <span className="podium-player-name">{p.name}</span>
                <div className="podium-bar">
                  <span className="podium-rank-label">{rankNum}</span>
                </div>
                <span className="podium-score-label">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        <div className="scoreboard-history-section mt-12">
          <h3>Full Game Statistics</h3>
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Tricks</th>
                  {players.map(p => (
                    <th key={p.name}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, hIdx) => (
                  <tr key={hIdx}>
                    <td>Round {h.round} {h.isSkipped && '(Skipped)'}</td>
                    <td>{h.isSkipped ? '-' : h.tricks}</td>
                    {players.map(p => {
                      const snap = h.playerSnapshots[p.name];
                      if (!snap) return <td key={p.name}>-</td>;
                      return (
                        <td key={p.name}>
                          <div className="table-score-cell">
                            <span className="total">{snap.score}</span>
                            <span className={`delta ${snap.delta >= 0 ? 'pos' : 'neg'}`}>
                              ({snap.delta >= 0 ? `+${snap.delta}` : snap.delta})
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="step-actions mt-8">
          <button className="btn btn-secondary" onClick={restartWithSamePlayers}>
            <RotateCcw size={16} /> Play Again (Same Players)
          </button>
          <button 
            className="btn btn-accent btn-large"
            onClick={() => {
              // Reset state and go home
              setPlayers([]);
              setHistory([]);
              setView('HOME');
            }}
          >
            Back to Home Screen
          </button>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div className="history-screen fade-in">
        <div className="top-navigation">
          <button className="btn-back" onClick={() => setView('HOME')}>
            <ArrowLeft /> Back
          </button>
          <h2>Game History Log</h2>
          {pastGames.length > 0 ? (
            <button className="btn btn-danger btn-sm" onClick={clearAllHistory}>
              Clear All
            </button>
          ) : (
            <div style={{ width: '40px' }}></div>
          )}
        </div>

        <div className="history-content glass-panel">
          {pastGames.length === 0 ? (
            <div className="empty-state">
              <History size={48} className="text-muted animate-pulse" />
              <h3>No game history yet</h3>
              <p>Completed games will automatically be saved here.</p>
              <button className="btn btn-primary mt-4" onClick={() => setView('SETUP')}>
                Start Game Now
              </button>
            </div>
          ) : (
            <div className="history-games-list">
              {pastGames.map((game) => {
                // Find winner(s) with highest score
                const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
                const winnerScore = sortedPlayers[0]?.score || 0;

                return (
                  <div key={game.id} className="history-game-card glass-item">
                    <div className="hg-header">
                      <div className="hg-meta">
                        <span className="hg-date">{game.date}</span>
                        <span className="hg-badge">{game.totalRounds} Rounds Played</span>
                      </div>
                      <button 
                        className="btn-icon-only text-danger"
                        onClick={(e) => deletePastGame(game.id, e)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="hg-winner-display">
                      <Trophy size={20} className="text-yellow" />
                      <span>
                        Winner: <strong>{game.winners.join(', ')}</strong> ({winnerScore} pts)
                      </span>
                    </div>

                    <div className="hg-players-grid">
                      {game.players.map(p => (
                        <div key={p.name} className={`hg-player-score-bubble ${game.winners.includes(p.name) ? 'winner-bubble' : ''}`}>
                          <span>{p.name}</span>
                          <strong>{p.score} pts</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRules = () => {
    return (
      <div className="rules-screen fade-in">
        <div className="top-navigation">
          <button className="btn-back" onClick={() => setView('HOME')}>
            <ArrowLeft /> Back
          </button>
          <h2>Game Rules & Scoring</h2>
          <div style={{ width: '40px' }}></div>
        </div>

        <div className="rules-content glass-panel text-left">
          <h3>Game Rules</h3>
          <p>
            <strong>Oh Hell</strong> (known as <em>Boerenbridge</em> in Dutch) is a trick-taking card game where the objective is to bid exactly the number of tricks you will win in each round.
          </p>
          
          <div className="info-callout mt-4">
            <h4>Bidding Constraint (Dealer Rule)</h4>
            <p>
              To prevent every player from succeeding, the sum of all bids in a round <strong>cannot</strong> equal the total number of tricks available. This puts extra pressure on the dealer (the last player to bid) who is forced to bid a number that breaks the balance.
            </p>
          </div>

          <div className="info-callout mt-4">
            <h4>Tricks Sum Constraint</h4>
            <p>
              At the end of the round, the total tricks won by all players <strong>must equal</strong> the round's total tricks.
            </p>
          </div>

          <h3 className="mt-8">Scoring System</h3>
          <p>Scores are updated after each round as follows:</p>
          
          <div className="rules-scoring-grid mt-4">
            <div className="scoring-card success">
              <h4>Exact Bid</h4>
              <span className="scoring-formula">10 + (2 × tricks won)</span>
              <p>If you bid 3 and win 3, you get: <br /><strong>10 + (2 × 3) = 16 points</strong></p>
            </div>

            <div className="scoring-card failed">
              <h4>Missed Bid</h4>
              <span className="scoring-formula">–2 × |bid – wins|</span>
              <p>If you bid 2 and win 5 (3 off), you get: <br /><strong>–2 × 3 = –6 points</strong></p>
            </div>
          </div>

          <div className="card-rotation-info mt-6">
            <h4>Starting Player Rotation</h4>
            <p>
              The player who starts bidding rotates clockwise each round (Round 1: Player 1, Round 2: Player 2, and so on). This ensures fair dealer pressure.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {view === 'HOME' && renderHome()}
        {view === 'SETUP' && renderSetup()}
        {view === 'PLAY' && renderActiveGame()}
        {view === 'HISTORY' && renderHistory()}
        {view === 'RULES' && renderRules()}
      </div>

      {modal.isOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h3>{modal.title}</h3>
              <button className="btn-icon-only" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>{modal.message}</p>
            </div>
            <div className="modal-footer">
              {modal.type === 'confirm' && (
                <button className="btn btn-secondary" onClick={modal.onCancel || closeModal}>
                  Cancel
                </button>
              )}
              <button className="btn btn-accent" onClick={modal.onConfirm}>
                {modal.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
