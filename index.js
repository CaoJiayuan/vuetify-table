import VuetifyTable from './lib/Datatable.vue';
VuetifyTable.install = function (Vue) {
  Vue.component('vuetify-table', VuetifyTable)
}

export default VuetifyTable
