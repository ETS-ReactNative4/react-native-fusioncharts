
window.loadApp = function (data) {
  Vue.use(VueFusionCharts);

  const app = new Vue({
    el: '#app',
    data: {
      type: 'mscombi2d',
      width: '100%',
      height: '100%',
      dataFormat: 'json',
      dataSource: data
    }
  });
};
