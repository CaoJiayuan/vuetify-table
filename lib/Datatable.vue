<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-data-table :select-all="selectable" v-model="selected" :must-sort="mustSort"
                    :total-items="paginator.total" :dark="dark" disable-initial-sort
                    :headers="headerFields" :items="paginator.data" hide-actions :loading="loading" :hide-headers="hideHeaders"
                    :pagination.sync="pagination">
        <template slot="no-data">
          <v-layout justify-center>
            <v-chip v-html="placeholder" class="placeholder"></v-chip>
          </v-layout>
        </template>
        <template slot="items" slot-scope="props">
          <tr :class="props.selected ? 'selected' : ''">
            <td v-if="selectable">
              <v-checkbox
                primary
                hide-details
                v-model="props.selected"
              ></v-checkbox>
            </td>
            <td v-if="!field.action" :class="field.align ? 'text-xs-'+ field.align : 'text-xs-left'"
                v-for="field in headerFields"
                v-html="renderField(props.item, field, props.index)"
                @click="clickField(props.item, field, props)">
            </td>
            <td :class="'text-xs-' + actionsAlign" v-if="hasActions">
              <v-btn :flat="action.flat" :dark="action.dark"
                     small :key="index"
                     v-for="(action, index) in fixedActions" :color="action.color"
                     :class="action.class"
                     :fab="!action.text"
                     :icon="!action.text && !!action.icon"
                     v-if="showAction(action, props.item)"
                     :disabled="callParentMethod(action.disabled, props.item) === true"
                     @click="callParentMethod(action.click, props.item)">
                <v-icon>{{ action.icon }}</v-icon>
                {{ action.text }}
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
    <v-layout xs12 row>
      <v-flex xs9 class="text-xs-left">

        <v-pagination class="text-xs-center pt-2" @input="page" :total-visible="7" circle
                      v-model="pagination.page"
                      :length="paginator.last_page"></v-pagination>
        <v-btn :dark="dark" @click="refresh" :class="refreshing ? 'animate rotation' : ''"
               class="pagination__item circle refresh" depressed style="top: -10px;border-radius: 100% !important;" fab>
          <v-icon>refresh</v-icon>
        </v-btn>
      </v-flex>
      <v-layout xs3 row class="text-xl-right justify-center" >
        <v-flex xs4>
          <v-select
            :items="pageSizes"
            v-model="pageSize"
            single-line
            bottom
            label="Select"
            @input="load({})"
            class="pull-right"
          ></v-select>
        </v-flex>
        <v-subheader class="pull-right" style="height: 74px;">{{displayAction(paginator)}}</v-subheader>
      </v-layout>
    </v-layout>
  </v-layout>
</template>

<script>
  import pagination from './mixins/pagination';
  import {functions} from 'nerio-js-utils'

  const  {objectGet} = functions

  export default {
    name : 'vuetify-table',
    props     : {
      actions      : {
        type   : Array,
        default: () => []
      },
      headers      : {
        type   : Array,
        default: () => []
      },
      placeholder  : {
        type   : String,
        default: () => '没有更多数据'
      },
      actionsTitle : {
        type   : String,
        default: () => '操作'
      },
      actionsAlign : {
        type   : String,
        default: () => 'center'
      },
      mustSort     : {
        type   : Boolean,
        default: true
      },
      displayAction: {
        type   : Function,
        default: paginator => `条/页, 从${paginator.from}到${paginator.to}条，共${paginator.total}条`
      },
      selectable   : Boolean,
      hideHeaders   : Boolean,
      dark   : Boolean,
      value        : {
        type   : Array,
        default: () => []
      }
    },
    model     : {
      prop : 'value',
      event: 'change'
    },
    mixins    : [pagination],
    data() {
      return {
        headerFields      : [],
        fixedActions: [],
        pageSizes   : [
          10,
          15,
          20,
          25,
        ],
        showActions : false,
        selected    : [],
        findingDepth : 0
      };
    },
    computed  : {
      hasActions() {
        let has = false;
        this.actions.forEach(action => {
          has = true;
        });
        return has;
      },
    },
    components: {},
    methods   : {
      formatHeaders() {
        this.headerFields = this.headers.map(header => {
          header.align = header.align || 'left';
          return header;
        });
        this.hasActions && this.headerFields.push({
          text    : this.actionsTitle,
          align   : this.actionsAlign,
          sortable: false,
          action  : true
        });
      },
      fixActions() {
        let actions = _.clone(this.actions);
        this.fixedActions = actions.map(action => {
          let {icon = '', text = '', color = 'primary', dark = false, flat = false, granted = true, click} = action;

          if (granted !== true) {
            let fun = this.getParentMethod(granted);
            if (fun) {
              granted = fun;
            }
          } else {
            granted = item => true;
          }
          action.icon = icon;
          action.text = text;
          action.color = color;
          action.dark = dark;
          action.flat = flat;
          action.click = click;
          action.granted = granted;
          return action;
        });
      },
      renderField(item, field, index) {
        let key = field.value;
        let value = null;
        if (key === '$index') {
          let {per_page, current_page} = this.paginator;
          value = index + (per_page * (current_page - 1));
        } else {
          value = objectGet(item, key);
        }
        let display = field.display;
        if (!display) {
          return value;
        }
        return this.callParentMethod(display, value, item, this.$createElement);
      },
      showAction(action, item) {
        let show = true;
        if (action.granted) {
          show = this.callParentMethod(action.granted, item);
        }
        if (show) {
          this.showActions = true;
        }
        return show;
      },
      getParentMethod(method) {
        if (method === undefined) {
          return false;
        }
        if (typeof method === 'function') {
          return method;
        }

        let m = this.findParentMethod(method, this.$parent, 4);
        return m;
      },
      findParentMethod(method, $parent, deep = 3) {
        if ($parent === undefined) {
          this.findingDepth = 0;
          return false;
        }
        let m = $parent[method];
        if (m && typeof m === 'function') {
          this.findingDepth = 0;
          return m;
        } else  {
          if (this.findingDepth >= deep) {
            this.findingDepth = 0;
            return false;
          }
          this.findingDepth ++;
          return this.findParentMethod(method, $parent.$parent)
        }

      },
      callParentMethod(method, ...args) {
        let m = this.getParentMethod(method);
        if (m) {
          return m.call(this.$parent, ...args);
        }
        return m;
      },
      clickField(item, field, props) {
        this.selectRow(props);
        let value = item[field.value];
        let click = field.click;
        if (click) {
          this.callParentMethod(click, value, item);
        }
      },
      selectRow(row) {
        this.selected = [];
        this.selectable && (this.selected = [row.item]);
      }
    },
    mounted() {
      this.formatHeaders();
      this.fixActions();
      this.apiUrl && this.load({});
    },
    created() {

    },
    watch     : {
      pagination(now) {
        if (now.sortBy) {
          this.load({});
        }
      },
      selected(now) {
        this.$emit('change', now);
      }
    }
  };
</script>

<style lang="sass">
  .datatable
    .placeholder
      padding: 4px 10px
      color: white
      background-color: #1976d2
      opacity: .75
    tr.selected
      background-color: #e1e1e1e1
    &.datatable--select-all
      thead > tr > th:first-child
        width: 64px
  .refresh i
    line-height: 34px
</style>
