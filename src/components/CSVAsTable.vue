<template>
  <div>
    <table v-if="tableData.length">
      <thead>
      <tr>
        <th v-for="(header, index) in tableData[0]" :key="index">{{ header }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, rowIndex) in tableData.slice(1)" :key="rowIndex">
        <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import Papa, { ParseResult } from 'papaparse';
import { ref, watch } from 'vue';


const props = defineProps<{csv?: string}>()

const tableData = ref([] as ParseResult<unknown>['data']);

watch(() => props.csv, () => {
  if(!props.csv) {
    return
  }
  Papa.parse(props.csv, {
    complete: (results) => {
      tableData.value = results.data;
    }
  });
}, {
  immediate: true
})
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
}
</style>
