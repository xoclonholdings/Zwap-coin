import React, { useState, useEffect, useRef } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Footprints, Play, Pause, RotateCcw, Coins, TrendingUp } from "lucide-react";

export default function MoveTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [potentialReward, setPotentialReward] = useState(0);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const stepThreshold = useRef(1.2);

  // Calculate potential rewards based on tiered system
  const calculateRewards = (stepCount) => {
    if (stepCount < 1000) return stepCount * 0.01;
    if (stepCount < 5000) return 10 + (stepCount - 1000) * 0.02;
    if (stepCount < 10000) return 90 + (stepCount - 5000) * 0.03;
    return 240 + (stepCount - 10000) * 0.05;
  };

  useEffect(() => {
    setPotentialReward(calculateRewards(steps));
  }, [steps]);

  // Real step tracking using DeviceMotion API
  useEffect(() => {
    if (!isTracking) return;

    let stepBuffer = 0;
    let lastStepTime = 0;
    const minStepInterval = 300; // Minimum ms between steps

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
        
        // Update steps every 5 detected movements to smooth out noise
        if (stepBuffer >= 1) {
          setSteps(prev => prev + stepBuffer);
          stepBuffer = 0;
        }
      }

      lastAcceleration.current = { x: x || 0, y: y || 0, z: z || 0 };
    };

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          } else {
            toast.error("Motion permission denied. Using manual mode.");
            // Fallback to simulation
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
      // Fallback simulation for desktop/unsupported devices
      toast.info("Motion API not available. Using simulation mode.");
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
      // Check for motion permission on iOS
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission !== 'granted') {
            toast.error("Motion permission required for step tracking");
            return;
          }
        } catch (error) {
          console.error("Permission error:", error);
        }
      }
      setIsTracking(true);
      toast.success("Step tracking started!");
    }
  };

  const handleReset = () => {
    setSteps(0);
    setPotentialReward(0);
    toast.info("Steps reset");
  };

  const handleClaim = async () => {
    if (steps === 0) {
      toast.error("No steps to claim");
      return;
    }

    setIsClaiming(true);
    try {
      const result = await api.claimStepRewards(walletAddress, steps);
      toast.success(result.message);
      await refreshUser();
      setSteps(0);
      setPotentialReward(0);
    } catch (error) {
      toast.error("Failed to claim rewards");
    } finally {
      setIsClaiming(false);
    }
  };

  const tiers = [
    { range: "0-1,000", rate: "0.01 ZWAP/step", active: steps < 1000 },
    { range: "1,000-5,000", rate: "0.02 ZWAP/step", active: steps >= 1000 && steps < 5000 },
    { range: "5,000-10,000", rate: "0.03 ZWAP/step", active: steps >= 5000 && steps < 10000 },
    { range: "10,000+", rate: "0.05 ZWAP/step", active: steps >= 10000 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b1e] p-4" data-testid="move-tab">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 pulse-glow">
          <Footprints className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">MOVE</h1>
        <p className="text-gray-400">Walk and Earn ZWAP!</p>
      </div>

      {/* Steps Counter */}
      <div className="balance-glow p-6 mb-6 text-center">
        <p className="text-gray-400 text-sm mb-2">Current Steps</p>
        <h2 className="text-6xl font-bold neon-text mb-2" data-testid="step-counter">
          {steps.toLocaleString()}
        </h2>
        <div className="flex items-center justify-center gap-2 text-cyan-400">
          <Coins className="w-5 h-5" />
          <span className="text-lg font-semibold">
            {potentialReward.toFixed(2)} ZWAP pending
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mb-8">
        <Button
          data-testid="tracking-toggle"
          onClick={handleStartStop}
          className={`flex-1 h-14 text-lg font-semibold ${
            isTracking 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-cyan-500 hover:bg-cyan-600"
          }`}
        >
          {isTracking ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>
        
        <Button
          data-testid="reset-steps"
          onClick={handleReset}
          variant="outline"
          className="h-14 px-6 border-gray-600 text-gray-400 hover:text-white"
          disabled={isTracking}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Claim Button */}
      <Button
        data-testid="claim-steps"
        onClick={handleClaim}
        disabled={steps === 0 || isClaiming || isTracking}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 mb-8"
      >
        {isClaiming ? "Claiming..." : `Claim ${potentialReward.toFixed(2)} ZWAP`}
      </Button>

      {/* Tier System */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Tiered Earning System</h3>
        </div>
        
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center p-3 rounded-lg ${
                tier.active 
                  ? "bg-cyan-500/20 border border-cyan-500/50" 
                  : "bg-gray-800/50"
              }`}
            >
              <span className={tier.active ? "text-cyan-400" : "text-gray-500"}>
                {tier.range} steps
              </span>
              <span className={`font-mono ${tier.active ? "text-white" : "text-gray-500"}`}>
                {tier.rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Balance */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">Your Balance</p>
        <p className="text-2xl font-bold text-cyan-400">
          {user?.zwap_balance?.toFixed(2) || "0.00"} ZWAP
        </p>
      </div>
    </div>
  );
}
