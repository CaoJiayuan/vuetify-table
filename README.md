# Vuetify table

```npm i nerio-vuetify-table -S```

## Usage
```ecmascript 6 
import VuetifyTable from 'nerio-vuetify-table'
Vue.use(VuetifyTable)
```
```vue
<template>
 <vuetify-table :headers="headers"></vuetify-table>
</template>
<script >

export default {
    data(){
        return {
            headers: [
                {
                    text: 'Name', // Display header
                    value: 'name', // Display item key
                }
            ],
            actions: [
                {
                    text: 'Edit',
                    click: item => console.log(item)
                }
            ]
        }
    }
}
</script>
```

## Props

### ```headers``` table columns configs


<table>
  <thead>
    <tr>
      <th>prop</th>
      <th>type</th>
      <th>default</th>
      <th>description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>text</td>
      <td>string</td>
      <td></td>
      <td>title of this column</td>
    </tr>
    <tr>
      <td>value</td>
      <td>string</td>
      <td></td>
      <td>key of this column</td>
    </tr>
    <tr>
      <td>[display]</td>
      <td>string|function(value, item)</td>
      <td>undefined</td>
      <td>display callback function or method name of component</td>
    </tr>
    <tr>
      <td>[sortable]</td>
      <td>boolean</td>
      <td>true</td>
      <td>is column sortable</td>
    </tr>
    <tr>
      <td>[align]</td>
      <td>string</td>
      <td>left</td>
      <td>column align, left|center|right</td>
    </tr>
  </tbody>
</table>
