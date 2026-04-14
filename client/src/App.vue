<template>
  <div id="app">
    <ExpenseTracker />
  </div>
</template>

<script>
import ExpenseTracker from './components/ExpenseTracker.vue';

export default {
  name: 'App',
  components: { ExpenseTracker },
};
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background-color: #e5eee4;
  min-height: 100vh;
}
</style>