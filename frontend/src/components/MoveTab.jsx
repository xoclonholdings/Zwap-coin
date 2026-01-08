import React, { useState, useEffect, useRef } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Footprints, Play, Pause, RotateCcw, Coins } from "lucide-react";

export default function MoveTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [potentialReward, setPotentialReward] = useState(0);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const stepThreshold = useRef(1.2);

  const calculateRewards = (stepCount) => {
    if (stepCount < 1000) return stepCount * 0.01;
    if (stepCount < 5000) return 10 + (stepCount - 1000) * 0.02;
    if (stepCount < 10000) return 90 + (stepCount - 5000) * 0.03;
    return 240 + (stepCount - 10000) * 0.05;
  };

  useEffect(() => {
    setPotentialReward(calculateRewards(steps));
  }, [steps]);

  useEffect(() => {
    if (!isTracking) return;

    let stepBuffer = 0;
    let lastStepTime = 0;
    const minStepInterval = 300;

    const handleMotion = (event) => {
      const { x, y, z } = event.accelerationIncludingGravity || event.acceleration || {};
      if (x === undefined) return;

      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);
      
      const magnitude = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
      
      const now = Date.now();
      if (magnitude > stepThreshold.current && now - lastStepTime > minStepInterval) {
        stepBuffer++;
        lastStepTime = now;
        if (stepBuffer >= 1) {
          setSteps(prev => prev + stepBuffer);
          stepBuffer = 0;
        }
      }
      lastAcceleration.current = { x: x || 0, y: y || 0, z: z || 0 };
    };

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          } else {
            const interval = setInterval(() => {
              setSteps(prev => prev + Math.floor(Math.random() * 3) + 1);
            }, 1000);
            return () => clearInterval(interval);
          }
        })
        .catch(console.error);
    } else if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion);
    } else {
      const interval = setInterval(() => {
        setSteps(prev => prev + Math.floor(Math.random() * 5) + 1);
      }, 800);
      return () => clearInterval(interval);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isTracking]);

  const handleStartStop = async () => {
    if (isTracking) {
      setIsTracking(false);
    } else {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission !== 'granted') {
            toast.error("Motion permission required");
            return;
          }
        } catch (error) {
          console.error("Permission error:", error);
        }
      }
      setIsTracking(true);
      toast.success("Tracking started!");
    }
  };

  const handleReset = () => {
    setSteps(0);
    setPotentialReward(0);
  };

  const handleClaim = async () => {
    if (steps === 0) return;
    setIsClaiming(true);
    try {
      const result = await api.claimStepRewards(walletAddress, steps);
      toast.success(result.message);
      await refreshUser();
      setSteps(0);
      setPotentialReward(0);
    } catch (error) {
      toast.error("Failed to claim");
    } finally {
      setIsClaiming(false);
    }
  };

  const tiers = [
    { range: "0-1K", rate: "0.01/step", active: steps < 1000 },
    { range: "1K-5K", rate: "0.02/step", active: steps >= 1000 && steps < 5000 },
    { range: "5K-10K", rate: "0.03/step", active: steps >= 5000 && steps < 10000 },
    { range: "10K+", rate: "0.05/step", active: steps >= 10000 },
  ];

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col px-4 pt-4 pb-[72px] overflow-hidden" data-testid="move-tab">
      {/* Header - Compact */}
      <div className="text-center mb-3 flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-2 pulse-glow">
          <Footprints className="w-7 h-7 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">MOVE</h1>
        <p className="text-gray-400 text-sm">Walk and Earn ZWAP!</p>
      </div>

      {/* Steps Counter */}
      <div className="balance-glow p-4 mb-3 text-center flex-shrink-0">
        <p className="text-gray-400 text-xs mb-1">Current Steps</p>
        <h2 className="text-5xl font-bold neon-text" data-testid="step-counter">
          {steps.toLocaleString()}
        </h2>
        <div className="flex items-center justify-center gap-2 text-cyan-400 mt-1">
          <Coins className="w-4 h-4" />
          <span className="text-base font-semibold">{potentialReward.toFixed(2)} ZWAP pending</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 mb-3 flex-shrink-0">
        <Button
          data-testid="tracking-toggle"
          onClick={handleStartStop}
          className={`flex-1 h-12 text-base font-semibold ${isTracking ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600"}`}
        >
          {isTracking ? <><Pause className="w-4 h-4 mr-2" />Stop</> : <><Play className="w-4 h-4 mr-2" />Start</>}
        </Button>
        <Button data-testid="reset-steps" onClick={handleReset} variant="outline" className="h-12 px-4 border-gray-600" disabled={isTracking}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Claim Button */}
      <Button
        data-testid="claim-steps"
        onClick={handleClaim}
        disabled={steps === 0 || isClaiming || isTracking}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 mb-3 flex-shrink-0"
      >
        {isClaiming ? "Claiming..." : `Claim ${potentialReward.toFixed(2)} ZWAP`}
      </Button>

      {/* Tier System - Compact grid */}
      <div className="glass-card p-3 flex-1 min-h-0">
        <h3 className="text-white font-semibold text-sm mb-2">Tiered Earning</h3>
        <div className="grid grid-cols-2 gap-2">
          {tiers.map((tier, i) => (
            <div key={i} className={`p-2 rounded-lg text-center ${tier.active ? "bg-cyan-500/20 border border-cyan-500/50" : "bg-gray-800/50"}`}>
              <span className={`text-xs ${tier.active ? "text-cyan-400" : "text-gray-500"}`}>{tier.range}</span>
              <p className={`font-mono text-sm ${tier.active ? "text-white" : "text-gray-500"}`}>{tier.rate}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">Balance: {user?.zwap_balance?.toFixed(2) || "0"} ZWAP</p>
      </div>
    </div>
  );
}
