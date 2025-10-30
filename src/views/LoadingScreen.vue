<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PhBrain, PhMapPin, PhTree } from '@phosphor-icons/vue'

const progress = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 2
    } else {
      clearInterval(interval)
    }
  }, 30)
})
</script>

<template>
  <div class="loading-screen">
    <div class="loading-background">
      <!-- Animated gradient background -->
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="loading-content">
      <!-- Logo Animation -->
      <div class="logo-container">
        <div class="logo-circle">
          <!-- <PhBrain :size="64" weight="fill" class="logo-icon" /> -->
           <img src="@/assets/geosense.svg" alt="Logo" class="logo">
        </div>
        <div class="logo-ring ring-1"></div>
        <div class="logo-ring ring-2"></div>
        <div class="logo-ring ring-3"></div>
      </div>

      <!-- Brand Name -->
      <h1 class="brand-name">
        <span class="brand-text">GeoSense</span>
        <span class="brand-highlight">AI</span>
      </h1>

      <p class="brand-tagline">Mapping the Present. Predicting the Future.</p>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>

      <!-- Loading Text -->
      <div class="loading-text">
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
      </div>

      <!-- Floating Icons -->
      <div class="floating-elements">
        <div class="float-element element-1">
          <PhMapPin :size="24" weight="fill" />
        </div>
        <div class="float-element element-2">
          <PhTree :size="28" weight="fill" />
        </div>
        <div class="float-element element-3">
          <PhLeaf :size="20" weight="fill" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 50%, #C8E6C9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.logo {
  width: 128px;
  height: 128px;
}

.loading-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #81C784, #A5D6A7);
  bottom: -150px;
  right: -150px;
  animation-delay: 2s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #2E7D32, #388E3C);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

.loading-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
}

/* Logo Animation */
.logo-container {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 40px;
}

.logo-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  /* background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(46, 125, 50, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.logo-icon {
  color: white;
  animation: rotate 4s linear infinite;
}

.logo-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid;
  opacity: 0;
}

.ring-1 {
  width: 140px;
  height: 140px;
  border-color: rgba(46, 125, 50, 0.5);
  animation: ripple 2s ease-out infinite;
}

.ring-2 {
  width: 140px;
  height: 140px;
  border-color: rgba(76, 175, 80, 0.5);
  animation: ripple 2s ease-out 0.5s infinite;
}

.ring-3 {
  width: 140px;
  height: 140px;
  border-color: rgba(102, 187, 106, 0.5);
  animation: ripple 2s ease-out 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 20px 60px rgba(46, 125, 50, 0.4);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 25px 80px rgba(46, 125, 50, 0.6);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ripple {
  0% {
    width: 120px;
    height: 120px;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

/* Brand Name */
.brand-name {
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.brand-text {
  color: #1B5E20;
  animation: fadeInUp 0.8s ease-out;
}

.brand-highlight {
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.brand-tagline {
  font-size: 16px;
  color: #2E7D32;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 60px;
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

/* Progress Bar */
.progress-container {
  max-width: 400px;
  margin: 0 auto 20px;
  animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(46, 125, 50, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
  box-shadow: 0 0 20px rgba(46, 125, 50, 0.6);
}

.progress-text {
  font-size: 14px;
  color: #2E7D32;
  font-weight: 700;
}

/* Loading Text */
.loading-text {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Floating Elements */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.float-element {
  position: absolute;
  color: rgba(46, 125, 50, 0.15);
  animation: floatAround 8s ease-in-out infinite;
}

.element-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.element-2 {
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.element-3 {
  bottom: 25%;
  left: 25%;
  animation-delay: 4s;
}

@keyframes floatAround {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(90deg);
  }
  50% {
    transform: translate(0, -40px) rotate(180deg);
  }
  75% {
    transform: translate(-20px, -20px) rotate(270deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .brand-name {
    font-size: 36px;
    flex-direction: column;
    gap: 4px;
  }
  
  .brand-tagline {
    font-size: 12px;
  }
  
  .logo-container {
    width: 120px;
    height: 120px;
  }
  
  .logo-circle {
    width: 90px;
    height: 90px;
  }
  
  .logo-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
