<script setup>
</script>

<template>
  <div class="registry d-flex flex-column min-vh-100">
    <!-- ============ top navigation ============ -->
    <nav class="navbar navbar-expand sticky-top brand-nav">
      <div class="container-fluid px-3 px-lg-4">
        <RouterLink class="navbar-brand d-flex align-items-center gap-2 py-1" to="/divisions">
          <span class="brand-mark"></span>
          <span class="d-flex flex-column lh-sm">
            <span class="brand-en">Bangladesh Geo Registry</span>
            <span class="brand-bn">বাংলাদেশ জিও রেজিস্ট্রি</span>
          </span>
        </RouterLink>
      </div>
    </nav>

    <!-- ============ routed page content ============ -->
    <main class="flex-grow-1 main-area">
      <RouterView v-slot="{ Component, route }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <footer class="foot border-top py-2 px-3 px-lg-4">
      <!-- Data source removed -->
    </footer>
  </div>
</template>

<style scoped>
.registry {
  background: var(--paper);
}

/* ---------- navbar ---------- */
.brand-nav {
  background: var(--forest-deep);
  padding: 10px 0;
  box-shadow: 0 2px 10px rgba(8, 46, 32, 0.25);
  z-index: 1030;
}

.brand-mark {
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 38%,
    var(--red) 0 34%,
    #d9d2b8 35% 100%
  );
  animation: markIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes markIn {
  from {
    transform: scale(0.3) rotate(-25deg);
    opacity: 0;
  }

  to {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.brand-en {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--paper-raised);
}

.brand-bn {
  font-size: 10.5px;
  letter-spacing: 0.03em;
  color: #a9c2b2;
}

.source-link {
  font-size: 13px;
  font-weight: 500;
  color: #cfe2d7;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.source-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.foot {
  background: var(--paper-raised);
}

.foot p {
  font-size: 12px;
  color: var(--ink-faint);
}

.foot-bn {
  display: block;
  font-size: 11px;
  margin-top: 2px;
  color: var(--ink-faint);
  opacity: 0.85;
}

/* ---------- transitions ---------- */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>