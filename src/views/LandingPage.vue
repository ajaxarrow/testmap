<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhMapPin,
  PhChartLine,
  PhShieldCheck,
  PhUsers,
  PhTree,
  PhDropHalf,
  PhFire,
  PhWarning,
  PhArrowRight,
  PhLeaf,
  PhCloudRain,
  PhMountains,
  PhSun,
  PhMoon,
  PhWind,
  PhBrain,
  PhLightning,
  PhEye,
  PhStack,
  PhGlobe,
  PhRobot
} from '@phosphor-icons/vue'
import LoadingScreen from '@/views/LoadingScreen.vue'

const router = useRouter()
const isLoading = ref(true)
const isTransitioning = ref(false)
const scrollY = ref(0)

// Particle system for all sections
const particles = ref<Array<{ x: number; y: number; size: number; speed: number; delay: number }>>([])

onMounted(() => {
  // Simulate loading time
  setTimeout(() => {
    isLoading.value = false
  }, 2500)

  // Scroll detection
  const handleScroll = () => {
    scrollY.value = window.scrollY
  }
  window.addEventListener('scroll', handleScroll)

  // Generate particles
  for (let i = 0; i < 50; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 30 + 20,
      delay: Math.random() * 10
    })
  }

  // Intersection Observer for scroll animations
  setTimeout(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    // Observe all sections
    const sections = document.querySelectorAll('.scroll-animate')
    sections.forEach(el => {
      observer.observe(el)
    })
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', () => {})
})

const navigateToMap = () => {
  // Show loading transition
  isTransitioning.value = true
  
  // Navigate after loading animation
  setTimeout(() => {
    router.push('/map')
  }, 2500)
}

const features = [
  {
    icon: PhBrain,
    title: 'AI-Powered Analysis',
    description: 'Advanced artificial intelligence analyzes environmental patterns and predicts potential hazards'
  },
  {
    icon: PhLightning,
    title: 'Predictive Modeling',
    description: 'Machine learning algorithms forecast floods, fires, and environmental risks before they occur'
  },
  {
    icon: PhGlobe,
    title: 'Multi-Source Integration',
    description: 'Combines Google Earth, CENRO data, and local sources for comprehensive geospatial intelligence'
  },
  {
    icon: PhEye,
    title: 'Real-Time Monitoring',
    description: 'Continuous surveillance of environmental conditions with instant alerts and notifications'
  },
  {
    icon: PhUsers,
    title: 'Citizen Intelligence Network',
    description: 'Barangay officials and volunteers contribute real-time reports for community-driven insights'
  },
  {
    icon: PhStack,
    title: 'Multi-Layer Mapping',
    description: 'View and analyze multiple geospatial layers simultaneously for comprehensive environmental insights'
  }
]

const stats = [
  { value: '15+', label: 'Barangays Monitored' },
  { value: 'AI', label: 'Powered Intelligence' },
  { value: '24/7', label: 'Predictive Analysis' },
  { value: '99%', label: 'Forecast Accuracy' }
]
</script>

<template>
  <LoadingScreen v-if="isLoading || isTransitioning" />
  
  <div v-else class="landing-page">
    <!-- Hero Section - Modern Wave Design -->
    <section class="hero-section">
      <!-- Animated Wave Background -->
      <div class="wave-container">
        <svg class="wave wave-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#C8E6C9" fill-opacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg class="wave wave-2" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#A5D6A7" fill-opacity="0.2" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <!-- Floating Icons Animation -->
      <div class="floating-icons">
        <div class="float-icon icon-brain"><PhBrain :size="40" weight="duotone" /></div>
        <div class="float-icon icon-globe"><PhGlobe :size="35" weight="duotone" /></div>
        <div class="float-icon icon-lightning"><PhLightning :size="30" weight="duotone" /></div>
        <div class="float-icon icon-eye"><PhEye :size="38" weight="duotone" /></div>
      </div>

      <!-- Particles -->
      <div class="particles-container">
        <div 
          v-for="(particle, index) in particles.slice(0, 20)" 
          :key="index"
          class="particle"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`
          }"
        ></div>
      </div>
      
      <div class="hero-content">
        <!-- <div class="hero-badge">
          <PhBrain :size="20" weight="fill" />
          <span>AI-Powered Geospatial Intelligence</span>
        </div> -->

        <img src="@/assets/geosense.svg" alt="Logo" class="logo">
        
        <h1 class="hero-title">
          <span class="gradient-text">GeoSense <span>AI</span></span>
          <br>
          Mapping the <span>Present</span>. Predicting the <span>Future</span>.
        </h1>
        
        <p class="hero-description">
          Harness the power of artificial intelligence for predictive environmental analysis. 
          Integrating Google Earth, CENRO data, and citizen intelligence to protect Malaybalay's natural resources.
        </p>
        
        <div class="hero-actions">
          <VBtn 
            size="x-large" 
            color="primary" 
            rounded="pill"
            class="explore-btn"
            @click="navigateToMap"
          >
            <PhRobot :size="24" weight="fill" class="mr-2" />
            Launch GeoSense AI
            <PhArrowRight :size="20" weight="bold" class="ml-2" />
          </VBtn>
          
          <VBtn 
            size="x-large" 
            variant="outlined" 
            rounded="pill"
            class="learn-btn"
          >
            Learn More
          </VBtn>
        </div>
        
        <!-- Floating Icons -->
        <div class="floating-icons">
          <div class="float-icon icon-1">
            <PhTree :size="32" weight="fill" />
          </div>
          <div class="float-icon icon-2">
            <PhCloudRain :size="28" weight="fill" />
          </div>
          <div class="float-icon icon-3">
            <PhMountains :size="30" weight="fill" />
          </div>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <div class="scroll-line"></div>
        <span>Scroll to explore</span>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section scroll-animate">
      <!-- Particles -->
      <div class="particles-container">
        <div 
          v-for="(particle, index) in particles.slice(20, 30)" 
          :key="index"
          class="particle"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`
          }"
        ></div>
      </div>

      <div class="container">
        <div class="stats-grid">
          <div 
            v-for="(stat, index) in stats" 
            :key="index"
            class="stat-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section - Bento Grid Design -->
    <section class="features-section scroll-animate">
      <!-- Particles -->
      <div class="particles-container">
        <div 
          v-for="(particle, index) in particles.slice(30, 40)" 
          :key="index"
          class="particle"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`
          }"
        ></div>
      </div>

      <div class="container">
        <!-- Section Header with Decorative Elements -->
        <div class="section-header">
          <div class="header-decoration">
            <div class="decoration-line"></div>
            <PhBrain :size="32" weight="fill" class="header-icon" />
            <div class="decoration-line"></div>
          </div>
          <h2 class="section-title">AI-Driven Intelligence Platform</h2>
          <p class="section-subtitle">
            Advanced technology meets environmental stewardship
          </p>
        </div>
        
        <!-- Bento Grid Layout -->
          <div class="bento-grid">
    <div 
      v-for="(feature, index) in features" 
      :key="index"
      class="bento-card scroll-card"
      :class="`card-${index + 1}`"
      :style="{ animationDelay: `${index * 0.1}s` }"
    >
      <div class="card-glow"></div>
      <div class="card-content">
        <div class="feature-icon-wrapper">
          <component :is="feature.icon" :size="40" weight="duotone" class="feature-icon" />
        </div>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-description">{{ feature.description }}</p>
      </div>
    </div>
  </div>
      </div>
    </section>

    <!-- Mission Section - Split Design with Visual -->
    <section class="mission-section scroll-animate">
      <!-- Particles -->
      <div class="particles-container">
        <div 
          v-for="(particle, index) in particles.slice(40, 50)" 
          :key="index"
          class="particle"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`
          }"
        ></div>
      </div>

      <div class="container-wide">
        <div class="mission-grid">
          <!-- Left Side - Visual -->
          <div class="mission-visual">
            <div class="visual-card">
              <div class="circuit-pattern"></div>
              <div class="ai-visualization">
                <PhBrain :size="120" weight="duotone" class="brain-icon" />
                <div class="pulse-ring ring-1"></div>
                <div class="pulse-ring ring-2"></div>
                <div class="pulse-ring ring-3"></div>
              </div>
              <div class="data-points">
                <div class="data-point point-1"><PhLightning :size="24" weight="fill" /></div>
                <div class="data-point point-2"><PhGlobe :size="24" weight="fill" /></div>
                <div class="data-point point-3"><PhEye :size="24" weight="fill" /></div>
                <div class="data-point point-4"><PhStack :size="24" weight="fill" /></div>
              </div>
            </div>
          </div>
          
          <!-- Right Side - Content -->
          <div class="mission-content">
            <div class="content-badge">
              <PhRobot :size="20" weight="fill" />
              <span>Powered by Intelligence</span>
            </div>
            <h2 class="mission-title">
              Transforming Environmental 
              <span class="highlight-text">Monitoring with AI</span>
            </h2>
            <p class="mission-description">
              GeoSense AI combines cutting-edge artificial intelligence with comprehensive geospatial data 
              to predict environmental threats, suggest mitigation strategies, and empower communities 
              with actionable insights for protecting Malaybalay's natural resources.
            </p>
            
            <div class="mission-features">
              <div class="mission-feature">
                <div class="feature-icon-small">
                  <PhLightning :size="24" weight="fill" />
                </div>
                <div class="feature-text">
                  <h4>Predictive Analysis</h4>
                  <p>Forecast environmental risks before they occur</p>
                </div>
              </div>
              <div class="mission-feature">
                <div class="feature-icon-small">
                  <PhBrain :size="24" weight="fill" />
                </div>
                <div class="feature-text">
                  <h4>AI Intelligence</h4>
                  <p>Machine learning for pattern recognition</p>
                </div>
              </div>
              <div class="mission-feature">
                <div class="feature-icon-small">
                  <PhShieldCheck :size="24" weight="fill" />
                </div>
                <div class="feature-text">
                  <h4>Mitigation Strategies</h4>
                  <p>Actionable recommendations for prevention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section - Gradient Card Design -->
    <section class="cta-section scroll-animate">
      <!-- Particles -->
      <div class="particles-container">
        <div 
          v-for="(particle, index) in particles.slice(0, 15)" 
          :key="'cta-' + index"
          class="particle particle-white"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`
          }"
        ></div>
      </div>

      <div class="container">
        <div class="cta-card">
          <div class="cta-background">
            <div class="gradient-orb orb-left"></div>
            <div class="gradient-orb orb-right"></div>
            <div class="grid-pattern"></div>
          </div>
          
          <div class="cta-content">
            <div class="cta-icon-group">
              <PhRobot :size="64" weight="duotone" class="cta-main-icon" />
              <div class="icon-orbit">
                <PhLightning :size="24" weight="fill" class="orbit-icon icon-1" />
                <PhGlobe :size="24" weight="fill" class="orbit-icon icon-2" />
                <PhEye :size="24" weight="fill" class="orbit-icon icon-3" />
              </div>
            </div>
            
            <h2 class="cta-title">Experience AI-Powered Monitoring</h2>
            <p class="cta-description">
              Join the future of environmental intelligence. Start predicting and preventing today.
            </p>
            
            <div class="cta-actions">
              <VBtn 
                size="x-large" 
                rounded="pill"
                class="cta-btn-primary"
                @click="navigateToMap"
              >
                <PhBrain :size="24" weight="fill" class="mr-2" />
                Launch Platform
                <PhArrowRight :size="20" weight="bold" class="ml-2" />
              </VBtn>
              
              <div class="cta-stats">
                <div class="mini-stat">
                  <PhUsers :size="20" weight="fill" />
                  <span>15+ Barangays</span>
                </div>
                <div class="mini-stat">
                  <PhLightning :size="20" weight="fill" />
                  <span>99% Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <PhBrain :size="32" weight="fill" />
            <span>GeoSense AI</span>
          </div>
          <p class="footer-text">
            AI-Powered Geospatial Intelligence Platform
          </p>
          <p class="footer-copyright">
            © 2025 GeoSense AI - CENRO Malaybalay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>

.landing-page {
  width: 100%;
  overflow-x: hidden;
  background: #FFFFFF;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

.container-wide {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 2;
}

/* Hero Section - Wave Design */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(180deg, #F1F8E9 0%, #E8F5E8 100%);
}

/* Wave Background */
.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  animation: waveMove 15s ease-in-out infinite;
}

.wave-1 {
  animation-delay: 0s;
}

.wave-2 {
  animation-delay: 2s;
}

@keyframes waveMove {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-25px) translateY(-10px);
  }
}

/* Floating Icons */
.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.float-icon {
  position: absolute;
  color: #4CAF50;
  opacity: 0.15;
  animation: floatUpDown 6s ease-in-out infinite;
}

.icon-brain {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.icon-globe {
  top: 25%;
  right: 15%;
  animation-delay: 1s;
}

.icon-lightning {
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.icon-eye {
  bottom: 20%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes floatUpDown {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
  }
}

/* Particles System */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.6) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.4;
  animation: particleFloat infinite ease-in-out;
  will-change: transform, opacity;
}

.particle-white {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-100px) translateX(50px) scale(1.2);
    opacity: 0.6;
  }
}

/* Scroll Animations - Simplified and Always Visible */
.scroll-animate {
  opacity: 1;
  transform: translateY(0);
  animation: fadeInUp 0.8s ease-out;
}

.scroll-animate.animate-in {
  animation: fadeInUpBounce 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUpBounce {
  0% {
    opacity: 0.5;
    transform: translateY(40px);
  }
  60% {
    opacity: 1;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation for children */
.scroll-animate.animate-in .stat-card,
.scroll-animate.animate-in .bento-card {
  animation: fadeInUp 0.8s ease-out backwards;
}

.scroll-animate.animate-in .stat-card:nth-child(1) { animation-delay: 0.1s; }
.scroll-animate.animate-in .stat-card:nth-child(2) { animation-delay: 0.2s; }
.scroll-animate.animate-in .stat-card:nth-child(3) { animation-delay: 0.3s; }
.scroll-animate.animate-in .stat-card:nth-child(4) { animation-delay: 0.4s; }

.scroll-animate.animate-in .bento-card:nth-child(1) { animation-delay: 0.1s; }
.scroll-animate.animate-in .bento-card:nth-child(2) { animation-delay: 0.2s; }
.scroll-animate.animate-in .bento-card:nth-child(3) { animation-delay: 0.3s; }
.scroll-animate.animate-in .bento-card:nth-child(4) { animation-delay: 0.4s; }
.scroll-animate.animate-in .bento-card:nth-child(5) { animation-delay: 0.5s; }
.scroll-animate.animate-in .bento-card:nth-child(6) { animation-delay: 0.6s; }

.scroll-card {
  will-change: transform;
  transition: transform 0.3s ease-out;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 120px 24px 80px;
  max-width: 900px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid #4CAF50;
  border-radius: 50px;
  color: #2E7D32;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.15);
  animation: fadeInDown 0.8s ease-out, badgePulse 3s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.hero-title {
  font-size: 40px;
  
  color: #1B5E20;
  line-height: 1.1;
  margin-bottom: 24px;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.hero-title span {
  /* font-size: 72px; */
  color: #4CAF50;
  /* font-weight: bolder; */
}

.gradient-text {
    font-size: 72px;
    font-weight: 900;
    color: #69a301;
  
}

.gradient-text span {
    color: #133903;
}

@keyframes gradientShift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(10deg); }
}

.hero-description {
  font-size: 20px;
  color: #2E7D32;
  line-height: 1.8;
  margin-bottom: 48px;
  font-weight: 500;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.explore-btn {
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%) !important;
  box-shadow: 0 8px 32px rgba(46, 125, 50, 0.4);
  transition: all 0.3s ease;
  font-weight: 700 !important;
}

.explore-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 48px rgba(46, 125, 50, 0.6);
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%) !important;
}

.learn-btn {
  border: 2px solid #2E7D32 !important;
  color: #2E7D32 !important;
  background: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s ease;
  font-weight: 700 !important;
}

.learn-btn:hover {
  background: #2E7D32 !important;
  color: white !important;
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 32px rgba(46, 125, 50, 0.3);
}

/* Floating Icons */
.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.float-icon {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.icon-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.icon-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.icon-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: fadeIn 1s ease-out 1s backwards;
}

.scroll-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.6));
  animation: scrollDown 2s ease-in-out infinite;
}

@keyframes scrollDown {
  0%, 100% { opacity: 0; transform: translateY(-10px); }
  50% { opacity: 1; transform: translateY(10px); }
}

/* Stats Section */
.stats-section {
  padding: 80px 0;
  background: linear-gradient(180deg, #FFFFFF 0%, #F1F8E9 100%);
  position: relative;
  overflow: hidden;
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to bottom, #C8E6C9, transparent);
  opacity: 0.3;
  z-index: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}

.stat-card {
  text-align: center;
  padding: 40px 32px;
  background: white;
  border: 2px solid #E8F5E8;
  border-radius: 20px;
  transition: all 0.4s ease;
  animation: fadeInUp 0.6s ease-out backwards;
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.08);
}

.stat-card:hover {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
  border-color: #4CAF50;
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(46, 125, 50, 0.15);
}

.stat-value {
  font-size: 56px;
  font-weight: 900;
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  animation: countUp 2s ease-out;
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-label {
  font-size: 14px;
  color: #2E7D32;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* Features Section */
.features-section {
  padding: 120px 0;
  background: linear-gradient(180deg, #F1F8E9 0%, #E8F5E8 100%);
  position: relative;
  overflow: hidden;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(76, 175, 80, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(102, 187, 106, 0.05) 0%, transparent 50%);
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 52px;
  font-weight: 900;
  color: #1B5E20;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
}

.section-subtitle {
  font-size: 20px;
  color: #2E7D32;
  font-weight: 500;
}

/* Header Decoration */
.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.decoration-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #4CAF50, transparent);
  border-radius: 2px;
}

.header-icon {
  color: #2E7D32;
}

/* Bento Grid Layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  margin-top: 40px;
  padding: 0 16px;
}



.bento-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bento-card:hover {
  transform: translateY(-8px);
}

.bento-card:hover .card-glow {
  opacity: 1;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(76, 175, 80, 0.1));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
}

.card-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bento-card:hover .card-content {
  border-color: #4CAF50;
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.2);
  transition: all 0.3s ease;
}

.bento-card:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.feature-icon {
  color: white;
}

.card-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, transparent 50%, #E8F5E8 50%);
  transition: background 0.4s ease;
}

.bento-card:hover .card-corner {
  background: linear-gradient(135deg, transparent 50%, #C8E6C9 50%);
}

.feature-title {
  font-size: 18px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.feature-description {
  font-size: 14px;
  line-height: 1.6;
  color: #2E7D32;
  margin: 0;
}

/* Mission Section - Split Design */
.mission-section {
  padding: 120px 0;
  background: #FFFFFF;
  position: relative;
  overflow: hidden;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

/* Mission Visual */
.mission-visual {
  position: relative;
}

.visual-card {
  position: relative;
  background: linear-gradient(135deg, #E8F5E8, #F1F8E9);
  border-radius: 32px;
  padding: 60px;
  box-shadow: 0 20px 60px rgba(46, 125, 50, 0.15);
  overflow: hidden;
}

.circuit-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(#C8E6C9 1px, transparent 1px),
    linear-gradient(90deg, #C8E6C9 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.ai-visualization {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.brain-icon {
  color: #2E7D32;
  position: relative;
  z-index: 2;
  animation: brainPulse 3s ease-in-out infinite;
}

@keyframes brainPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pulse-ring {
  position: absolute;
  border: 3px solid #4CAF50;
  border-radius: 50%;
  opacity: 0;
  animation: pulseRing 3s ease-out infinite;
}

.ring-1 {
  width: 200px;
  height: 200px;
  animation-delay: 0s;
}

.ring-2 {
  width: 200px;
  height: 200px;
  animation-delay: 1s;
}

.ring-3 {
  width: 200px;
  height: 200px;
  animation-delay: 2s;
}

@keyframes pulseRing {
  0% {
    width: 120px;
    height: 120px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

.data-points {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-point {
  position: absolute;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E7D32;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.2);
  animation: dataFloat 4s ease-in-out infinite;
}

.point-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.point-2 {
  top: 15%;
  right: 15%;
  animation-delay: 1s;
}

.point-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 2s;
}

.point-4 {
  bottom: 15%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes dataFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* Mission Content */
.mission-content {
  padding: 40px 0;
}

.content-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #E8F5E8;
  border: 2px solid #4CAF50;
  border-radius: 50px;
  color: #2E7D32;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 24px;
}

.mission-title {
  font-size: 48px;
  font-weight: 900;
  color: #1B5E20;
  line-height: 1.2;
  margin-bottom: 24px;
}

.highlight-text {
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mission-description {
  font-size: 18px;
  color: #2E7D32;
  line-height: 1.8;
  margin-bottom: 40px;
}

.mission-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mission-feature {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.feature-icon-small {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.2);
}

.feature-text h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1B5E20;
  margin-bottom: 4px;
}

.feature-text p {
  font-size: 15px;
  color: #2E7D32;
  line-height: 1.6;
}

/* CTA Section - Gradient Card */
.cta-section {
  padding: 120px 0;
  background: #F1F8E9;
  position: relative;
  overflow: hidden;
}

.cta-card {
  position: relative;
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
  border-radius: 40px;
  padding: 80px 60px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(46, 125, 50, 0.3);
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.orb-left {
  width: 400px;
  height: 400px;
  background: #66BB6A;
  top: -100px;
  left: -100px;
  animation: orbFloat 8s ease-in-out infinite;
}

.orb-right {
  width: 350px;
  height: 350px;
  background: #81C784;
  bottom: -80px;
  right: -80px;
  animation: orbFloat 10s ease-in-out infinite reverse;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.cta-icon-group {
  position: relative;
  display: inline-block;
  margin-bottom: 32px;
}

.cta-main-icon {
  color: white;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  animation: iconBounce 3s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.icon-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
}

.orbit-icon {
  position: absolute;
  color: white;
  opacity: 0.6;
  animation: orbit 8s linear infinite;
}

.icon-1 {
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 0s;
}

.icon-2 {
  top: 50%;
  right: 0;
  transform: translate(50%, -50%);
  animation-delay: 2.67s;
}

.icon-3 {
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  animation-delay: 5.34s;
}

@keyframes orbit {
  from { transform: rotate(0deg) translateX(75px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(75px) rotate(-360deg); }
}

.cta-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.cta-description {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 40px;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.cta-btn-primary {
  background: white !important;
  color: #2E7D32 !important;
  font-weight: 700 !important;
  font-size: 18px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.cta-btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  background: #F1F8E9 !important;
}

.cta-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Footer */
.footer {
  padding: 60px 0;
  background: linear-gradient(180deg, #1B5E20 0%, #0D2818 100%);
  border-top: 3px solid #4CAF50;
}

.footer-content {
  text-align: center;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 26px;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.footer-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-weight: 500;
}

.footer-copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.95);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.6;
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

/* Responsive */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mission-grid {
    grid-template-columns: 1fr;
    gap: 60px;
  }
  
  .container-wide {
    padding: 0 24px;
  }
}

@media (min-width: 1200px) {
  .bento-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1400px;
    margin: 60px auto 0;
    padding: 0 32px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 40px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .section-title {
    font-size: 36px;
  }
  
   .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 24px;
  }
  
  .mission-title {
    font-size: 36px;
  }
  
  .ai-visualization {
    height: 300px;
  }
  
  .cta-title {
    font-size: 36px;
  }
  
  .cta-card {
    padding: 60px 30px;
  }
  
  .icon-orbit {
    display: none;
  }
}
</style>
