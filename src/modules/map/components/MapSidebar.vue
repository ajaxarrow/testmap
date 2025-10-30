<script setup lang="ts">
import {
  PhChartLine,
  PhMapPin,
  PhFileText,
  PhPlusCircle,
  PhHouse,
  PhGear,
  PhTree,
} from "@phosphor-icons/vue";

import { ref, computed, defineComponent, markRaw } from 'vue';
import MapAreasHeader from "./Areas/MapAreasHeader.vue";
import MapLayersHeader from "./Layers/MapLayersHeader.vue";
import MapMonitoringHeader from "./Monitoring/MapMonitoringHeader.vue";
import MapReportsHeader from "./Reports/MapReportsHeader.vue";
import MapConfigHeader from "./Config/MapConfigHeader.vue";
import MapAreasMainContent from "./Areas/MapAreasMainContent.vue";
import MapLayersMainContent from "./Layers/MapLayersMainContent.vue";
import MapMonitoringMainContent from "./Monitoring/MapMonitoringMainContent.vue";
import MapReportsMainContent from "./Reports/MapReportsMainContent.vue";
import MapConfigMainContent from "./Config/MapConfigMainContent.vue";

type CustomComponent = ReturnType<typeof defineComponent>;

const addItemDialogMenu = ref(false);
const showAdditionalContent = ref(false);
const header = ref<CustomComponent | null>(null);
const mainContent = ref<CustomComponent | null>(null);
const activeNav = ref('');

const sidebarStyle = computed(() => {
  if (showAdditionalContent.value) {
    return { width: '350px !important' }
  } else {
    return { width: '85px !important' }
  }
})

const navLinks = [
  {
    name: 'Barangays',
    icon: markRaw(PhMapPin),
    header: markRaw(MapAreasHeader),
    mainContent: markRaw(MapAreasMainContent)
  },
//   {
//     name: 'Layers',
//     icon: markRaw(PhMapPin),
//     header: markRaw(MapLayersHeader),
//     mainContent: markRaw(MapLayersMainContent)
//   },
//   {
//     name: 'Monitoring',
//     icon: markRaw(PhChartLine),
//     header: markRaw(MapMonitoringHeader),
//     mainContent: markRaw(MapMonitoringMainContent)
//   },
  {
    name: 'Reports',
    icon: markRaw(PhFileText),
    header: markRaw(MapReportsHeader),
    mainContent: markRaw(MapReportsMainContent)
  },
  {
    name: 'Config',
    icon: markRaw(PhGear),
    header: markRaw(MapConfigHeader),
    mainContent: markRaw(MapConfigMainContent)
  },
];

const assignContent = (headerComponent: CustomComponent, mainContentComponent: CustomComponent, activeNavTitle: string) => {
  if (activeNav.value === activeNavTitle) {
    showAdditionalContent.value = false;
    activeNav.value = '';
    header.value = null;
    mainContent.value = null;
    return;
  }
  showAdditionalContent.value = true;
  activeNav.value = activeNavTitle;
  header.value = headerComponent;
  mainContent.value = mainContentComponent;
};

// Dummy function for add button
const handleAddItem = () => {
  console.log('Add item clicked - dummy function');
  addItemDialogMenu.value = false;
};
</script>

<template>
  <VSheet class="sidebar ma-4 d-flex flex-column justify-start" rounded="xl" v-bind:style="sidebarStyle">
    <div class="d-flex">
      <div class="sidebar-main-container d-flex flex-column">
        <div class="sidebar-header">
          <VRow justify="center" align="center" class="mt-5 mb-4">
            <!-- Logo placeholder -->
            <VIcon size="48" color="primary">mdi-map</VIcon>
          </VRow>
        </div>
        <VDivider />
        <div class="mt-2">
          <VList>
            <!-- <VRow class="ma-0 justify-center mt-2 mb-4">
              <VMenu v-model="addItemDialogMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <PhPlusCircle
                    class="cursor-pointer add-item-button"
                    v-bind="props"
                    weight="fill"
                    size="62"
                  />
                </template>

                <VSheet width="220" height="140" class="add-item-menu">
                  <p class="text-center font-weight-bold pa-2 add-item-menu-title">Add New Item</p>
                  <VDivider />
                  <div class="pa-2">
                    <div 
                      class="add-item-menu-item cursor-pointer d-flex align-center my-2"
                      @click="handleAddItem"
                    >
                      <PhPlusCircle
                        class="mb-1 mr-1"
                        color="#3291C7"
                        weight="fill"
                        size="14"
                      />
                      Add Item (Dummy)
                    </div>
                  </div>
                </VSheet>
              </VMenu>
            </VRow> -->
            <VListItem
              :class="{ 'active-nav': activeNav === navLink.name }"
              v-for="navLink in navLinks"
              :key="navLink.name"
              variant="plain"
              class="nav-item cursor-pointer navigation-item"
              @click="assignContent(navLink.header, navLink.mainContent, navLink.name)"
            >
              <div class="d-flex flex-column justify-center align-center">
                <component :is="navLink.icon" size="24" class="icon" />
                {{ navLink.name }}
              </div>
            </VListItem>
          </VList>
        </div>
        <VSpacer />
        <VDivider />
        <div class="">
          <VList class="bottom-nav">
            <VListItem
              to="/dashboard"
              link
              class="nav-item navigation-item"
            >
              <div class="d-flex flex-column align-center">
                <PhHouse size="24" class="icon" />
                Dashboard
              </div>
            </VListItem>
          </VList>
        </div>
      </div>
      <VDivider v-if="showAdditionalContent" :vertical="true" />
      <div v-if="showAdditionalContent" class="sidebar-additional-content overflow-hidden">
        <div class="sidebar-header pa-5">
          <component :is="header" />
        </div>
        <VDivider />
        <div class="pa-5 scrollable-container">
          <component :is="mainContent" />
        </div>
      </div>
    </div>
  </VSheet>
</template>

<style scoped>
.scrollable-container {
  overflow-y: auto;
  height: 80vh;
}

.add-item-menu {
  border-radius: 15px !important;
  box-shadow: 0px 4px 10px 0px #5d6e87;
}

.add-item-button {
  color: #3291C7;
}

.add-item-button:hover {
  border-radius: 50% !important;
  color: #28749F;
}

.add-item-menu-title {
  font-size: 14px;
  font-weight: 700;
}

.add-item-menu-item {
  border-radius: 8px;
  padding: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #000000;
}

.add-item-menu-item:hover {
  background-color: #e0e3e3;
}

.v-row {
  flex: unset;
}

.sidebar {
  overflow: hidden;
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 95vh;
  transition: width 0.2s;
  box-shadow: 0px 0px 7px 0px #5d6e87;
}

.sidebar-main-container {
  height: 95vh;
  width: 85px !important;
}

.sidebar-additional-content {
  height: 95vh;
  width: 275px !important;
}

.sidebar-header {
  height: 87px;
}

.nav-item {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  height: 70px;
}

.active-nav {
  background-color: #f0f9f3;
  border-right: 3px solid #388E3C;
}

.navigation-item{
    transition: all 0.2s ease;
}
.navigation-item:hover {
  background-color: #f0f9f3;
}

.bottom-nav {
  border-bottom-right-radius: 25px;
  border-bottom-left-radius: 25px;
}

.v-list-item--active {
  background-color: #f0f9f3 !important;
  border-right: 3px solid #388E3C;
}

:deep(.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line) {
  padding: unset;
}

.v-list-item--variant-plain {
  opacity: 1;
}

.icon {
  color: #191919 !important;
}
</style>
