<template>
  <div class="hero-scene" :class="{ 'hero-scene--compact': !props.enabled }">
    <svg class="hero-scene__svg" viewBox="0 0 960 560" aria-hidden="true">
      <defs>
        <linearGradient id="heroLineInk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#cfd4dc" stop-opacity="0.06" />
          <stop offset="45%" stop-color="#4f7dff" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#eef1f4" stop-opacity="0.16" />
        </linearGradient>
        <linearGradient id="heroLineStone" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ebe4db" stop-opacity="0.08" />
          <stop offset="48%" stop-color="#d8a24d" stop-opacity="0.88" />
          <stop offset="100%" stop-color="#f5f1eb" stop-opacity="0.16" />
        </linearGradient>
        <radialGradient id="heroGlowInk" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4f7dff" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#4f7dff" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="heroGlowStone" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#d8a24d" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#d8a24d" stop-opacity="0" />
        </radialGradient>
        <filter id="heroStrongBlur">
          <feGaussianBlur stdDeviation="34" />
        </filter>
      </defs>

      <g class="hero-scene__bg">
        <circle cx="300" cy="182" r="112" fill="url(#heroGlowInk)" filter="url(#heroStrongBlur)" />
        <circle cx="694" cy="188" r="104" fill="url(#heroGlowStone)" filter="url(#heroStrongBlur)" />
        <circle cx="518" cy="368" r="168" fill="url(#heroGlowInk)" fill-opacity="0.08" filter="url(#heroStrongBlur)" />
      </g>

      <g class="hero-scene__orbit hero-scene__orbit--a">
        <path d="M140 338 C280 152, 520 126, 816 280" fill="none" stroke="url(#heroLineInk)" stroke-width="12" stroke-linecap="round" />
        <path d="M120 356 C292 214, 592 214, 820 252" fill="none" stroke="#d8dce2" stroke-opacity="0.46" stroke-width="1.6" stroke-dasharray="8 10" />
      </g>

      <g class="hero-scene__orbit hero-scene__orbit--b">
        <path d="M158 238 C340 382, 620 416, 830 240" fill="none" stroke="url(#heroLineStone)" stroke-width="10" stroke-linecap="round" />
        <path d="M172 228 C354 336, 648 356, 832 214" fill="none" stroke="#d8cbbb" stroke-opacity="0.46" stroke-width="1.4" stroke-dasharray="6 10" />
      </g>

      <g class="hero-scene__orbit hero-scene__orbit--c">
        <path d="M188 294 C360 116, 622 112, 780 328" fill="none" stroke="#7f98d8" stroke-opacity="0.3" stroke-width="2.2" />
        <path d="M214 404 C382 296, 616 268, 770 414" fill="none" stroke="#d8a24d" stroke-opacity="0.24" stroke-width="1.8" />
      </g>

      <g class="hero-scene__core-group">
        <path
          class="hero-scene__glass-shape"
          d="M476 160 C556 140, 646 174, 688 250 C724 316, 704 404, 632 442 C566 478, 470 458, 414 394 C362 334, 378 236, 476 160 Z"
        />
        <path
          class="hero-scene__glass-outline"
          d="M476 160 C556 140, 646 174, 688 250 C724 316, 704 404, 632 442 C566 478, 470 458, 414 394 C362 334, 378 236, 476 160 Z"
        />

        <g class="hero-scene__mesh">
          <path d="M458 214 L612 204" />
          <path d="M430 270 L662 250" />
          <path d="M420 334 L666 332" />
          <path d="M454 392 L634 412" />
          <path d="M466 190 L458 414" />
          <path d="M536 176 L516 426" />
          <path d="M614 194 L578 420" />
          <path d="M430 270 L516 176 L662 250" />
          <path d="M420 334 L466 190 L666 332" />
          <path d="M454 392 L536 176 L634 412" />
        </g>

        <circle class="hero-scene__core-glow" cx="552" cy="300" r="64" />
      </g>

      <g class="hero-scene__nodes">
        <circle cx="410" cy="292" r="7" />
        <circle cx="454" cy="232" r="6" />
        <circle cx="626" cy="222" r="5" />
        <circle cx="708" cy="286" r="7" />
        <circle cx="664" cy="382" r="6" />
        <circle cx="470" cy="408" r="7" />
        <circle cx="302" cy="356" r="8" />
        <circle cx="774" cy="338" r="8" />
      </g>

      <g class="hero-scene__sparkles">
        <circle cx="548" cy="268" r="3" />
        <circle cx="594" cy="310" r="2.6" />
        <circle cx="514" cy="338" r="2.4" />
        <circle cx="440" cy="286" r="2.8" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  enabled: boolean
  isDark: boolean
}>()
</script>

<style scoped lang="scss">
.hero-scene {
  position: relative;
  min-height: 34rem;
  overflow: hidden;
  border-radius: 2.2rem;
  background:
    radial-gradient(circle at 24% 22%, rgba(79, 125, 255, 0.08), transparent 22%),
    radial-gradient(circle at 78% 24%, rgba(216, 162, 77, 0.1), transparent 22%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.68));
}

.hero-scene--compact {
  min-height: 27rem;
}

.hero-scene__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-scene__orbit {
  transform-origin: 56% 50%;
}

.hero-scene__orbit--a {
  animation: orbit-shift-a 16s ease-in-out infinite alternate;
}

.hero-scene__orbit--b {
  animation: orbit-shift-b 18s ease-in-out infinite alternate;
}

.hero-scene__orbit--c {
  animation: orbit-shift-c 20s ease-in-out infinite alternate;
}

.hero-scene__core-group {
  transform-origin: 56% 54%;
  animation: core-float 10s ease-in-out infinite;
}

.hero-scene__glass-shape {
  fill: rgba(255, 255, 255, 0.82);
  stroke: rgba(255, 255, 255, 0.92);
  stroke-width: 1.8;
  filter: drop-shadow(0 20px 28px rgba(15, 23, 42, 0.12));
}

.hero-scene__glass-outline {
  fill: none;
  stroke: rgba(127, 152, 216, 0.24);
  stroke-width: 1.2;
}

.hero-scene__mesh path {
  fill: none;
  stroke: rgba(127, 152, 216, 0.22);
  stroke-width: 1.1;
}

.hero-scene__core-glow {
  fill: rgba(216, 162, 77, 0.24);
  filter: blur(26px);
}

.hero-scene__nodes circle {
  fill: rgba(79, 125, 255, 0.56);
  filter: drop-shadow(0 0 10px rgba(79, 125, 255, 0.16));
}

.hero-scene__sparkles circle {
  fill: rgba(255, 255, 255, 0.9);
  animation: sparkle 3.6s ease-in-out infinite;
}

.hero-scene__sparkles circle:nth-child(2) {
  animation-delay: 0.6s;
}

.hero-scene__sparkles circle:nth-child(3) {
  animation-delay: 1.1s;
}

.hero-scene__sparkles circle:nth-child(4) {
  animation-delay: 1.7s;
}

@keyframes orbit-shift-a {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100% {
    transform: translate3d(-8px, 8px, 0);
  }
}

@keyframes orbit-shift-b {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100% {
    transform: translate3d(10px, -6px, 0);
  }
}

@keyframes orbit-shift-c {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100% {
    transform: translate3d(6px, 6px, 0);
  }
}

@keyframes core-float {
  0% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -8px, 0);
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0.48;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}
</style>
