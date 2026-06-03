import React, { useState, useCallback } from 'react';
import NavBar from './components/NavBar';
import BuilderScreen from './screens/BuilderScreen';
import TimerScreen from './screens/TimerScreen';
import StopwatchScreen from './screens/StopwatchScreen';
import StreakScreen from './screens/StreakScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import { useStreak } from './hooks/useStreak';

/**
 * App — Root component with state-based screen routing.
 * Screens: builder, timer, stopwatch, streak
 */
export default function App() {
  const [activeScreen, setActiveScreen] = useState('builder');
  const [sessionRounds, setSessionRounds] = useState([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const streak = useStreak();

  const handleStartSession = useCallback((rounds) => {
    setSessionRounds(rounds);
    setActiveScreen('timer');
    setSessionDone(false);
  }, []);

  const handleStopSession = useCallback(() => {
    setActiveScreen('builder');
    setSessionRounds([]);
    setSessionDone(false);
  }, []);

  const handleSessionDone = useCallback(() => {
    setSessionDone(true);
  }, []);

  const handleSaveStreak = useCallback(
    ({ totalSeconds, rounds }) => {
      streak.addSession({
        totalSeconds,
        rounds,
      });
      setActiveScreen('builder');
      setSessionRounds([]);
      setSessionDone(false);
    },
    [streak]
  );

  const handleNavigate = useCallback(
    (screen) => {
      // Block nav only during active timer (not on summary screen)
      if (activeScreen === 'timer' && !sessionDone && screen !== 'timer') {
        return;
      }

      // If leaving timer summary, clean up session state
      if (activeScreen === 'timer' && sessionDone) {
        setSessionRounds([]);
        setSessionDone(false);
      }

      if (screen === 'timer') {
        setActiveScreen('builder');
      } else {
        setActiveScreen(screen);
      }
    },
    [activeScreen, sessionDone]
  );

  const renderScreen = () => {
    switch (activeScreen) {
      case 'builder':
        return <BuilderScreen onStartSession={handleStartSession} />;
      case 'timer':
        return (
          <TimerScreen
            rounds={sessionRounds}
            onStop={handleStopSession}
            onSaveStreak={handleSaveStreak}
            onSessionDone={handleSessionDone}
          />
        );
      case 'stopwatch':
        return <StopwatchScreen />;
      case 'streak':
        return <StreakScreen />;
      default:
        return <BuilderScreen onStartSession={handleStartSession} />;
    }
  };

  return (
    <div className="app-load h-full flex flex-col bg-kronos-bg">
      {/* Welcome splash screen */}
      {showWelcome && (
        <WelcomeScreen onComplete={() => setShowWelcome(false)} />
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '56px' }}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <NavBar activeScreen={activeScreen} onNavigate={handleNavigate} />
    </div>
  );
}

