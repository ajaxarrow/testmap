<script setup lang="ts"></script>

<template>
  <RouterView/>
</template>

<style>
/* Global styles for report markers */
.report-marker {
  animation: pulse 2s infinite;
  transition: transform 0.2s ease;
}

.report-marker:hover {
  transform: scale(1.2);
  animation: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}
</style>
