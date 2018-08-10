import { functions, } from 'nerio-js-utils'

const {setQuery, httpQueryString, Storage} = functions

export default {
  props: {
    apiUrl: {
      type: String,
      default: () => ''
    },
    cacheExpire : {
      type:Number,
      default:() => 0
    }
  },
  data () {
    return {
      paginator: {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 0,
        next_page_url: null,
        prev_page_url: null,
        from: 0,
        to: 0,
        data: []
      },
      pagination: {},
      filters: {},
      loading: false,
      refreshing: false,
      pageSize: 10
    }
  },
  methods: {
    load ({per_page = this.pageSize, page = 1, sort, filters, search}, append = false) {
      this.loading = 'green'
      this.selected = []
      let params = {
        per_page,
        page,
      };
      let extras = {};
      let resolvedSort = sort !== undefined ? sort : this.resolveSort(this.pagination);
      if (resolvedSort) {
        extras.sort = resolvedSort;
      }
      if (search) {
        extras.filter = search;
      }
      params = Object.assign(params, extras);

      filters = filters ? this.buildFilters(filters) : this.filters
      return this.getData(this.apiUrl, Object.assign(params, filters), this.cacheExpire).then(response => {
        let paginator = response.data
        this.loading = false
        this.refreshing = false
        paginator.url = setQuery(response.config.url, response.config.params)
        let { total, per_page, current_page, last_page, next_page_url, prev_page_url, from, to, data, url  } = paginator
        this.paginator.total = total
        this.paginator.per_page = per_page
        this.paginator.current_page = current_page
        this.paginator.last_page = last_page
        this.paginator.next_page_url = next_page_url
        this.paginator.prev_page_url = prev_page_url
        this.paginator.prev_page_url = prev_page_url
        this.paginator.from = from ? from : 0
        this.paginator.to =  to ? to : 0
        this.paginator.url = url
        if (append) {
          this.paginator.data = this.paginator.data.concat(data)
        } else  {
          this.paginator.data = data
        }

        this.pagination.page = current_page
        this.pagination.rowsPerPage = per_page
        this.pagination.totalItems = total
        this.$emit('loaded', this.paginator)
      }).catch(error => {
        this.loading = false
        this.refreshing = false
      })
    },
    buildFilters (filters, name = 'filters') {
      let clone = _.clone(filters)
      let result = {}
      for (let k in clone) {
        if (clone.hasOwnProperty(k) && [null, '', undefined].indexOf(clone[k]) < 0) {
          let key = `${name}[${k}]`
          result[key] = clone[k]
        }
      }
      this.filters = result
      return result
    },
    resolveSort (pagination) {
      if (pagination.sortBy) {
        let key = pagination.sortBy
        key += pagination.descending ? '|desc' : '|asc'
        return key
      }
      return undefined
    },
    refresh () {
      this.refreshing = true
      this.pagination.sortBy = null
      return this.load({
        per_page: this.pageSize,
        page: 1,
        sort: null
      })
    },
    page (page, append = false) {
      return this.load({
        page: page
      }, append)
    },
    nextPage(append = false) {
      return this.load({
        page: this.paginator.current_page + 1
      }, append)
    },
    filter(filters){
      this.load({
         filters
      });
    },
    search(search){
      this.load({
        search
      });
    },
    getData (url, params = {}, cacheExpire = 0, config = {}) {

      let storage = new Storage()
      let conf = Object.assign({
        params: params
      }, config);
      if (cacheExpire > 0) {
        let key = url + '?' + httpQueryString(params);
        let data = storage.get(key)
        if (data && data.expires_in > new Date().getTime()) {
          return Promise.resolve(data.data)
        } else  {
          let expires_in = new Date().getTime() + (60 * cacheExpire * 1000)
          return axios.get(url, conf).then(response => {
            data = {
              expires_in,
              data : response
            }
            storage.put(key, data);

            return response;
          })
        }
      }

      return axios.get(url, conf)
    }
  }
}
